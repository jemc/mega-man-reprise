import { Engine } from "glaze/ecs/Engine"
import { Entity } from "glazejs/src/glaze/ecs/Entity"
import { Position } from "glaze/core/components/Position"
import { Extents } from "glaze/core/components/Extents"
import { PhysicsCollision } from "glaze/physics/components/PhysicsCollision"
import { PhysicsBody } from "glazejs/src/glaze/physics/components/PhysicsBody"
import { Body } from "glazejs/src/glaze/physics/Body"
import { Moveable } from "glazejs/src/glaze/core/components/Moveable"
import { Active } from "glaze/core/components/Active"
import { Graphics } from "glazejs/src/glaze/graphics/components/Graphics"
import { GZE } from "glazejs/src/glaze/GZE"

import Enemy from "../../components/Enemy"
import GraphicsAnimation from "../../components/GraphicsAnimation"
import DamagesPlayerOnContact from "../../components/DamagesPlayerOnContact"
import PlayerAware from "../../components/PlayerAware"
import FollowsPlayer from "../../components/FollowsPlayer"
import Health from "../../components/Health"
import States from "../../components/States"
import createExplodeBurst8 from "../projectile/createExplodeBurst8"
import DamagesEnemyOnContact from "../../components/DamagesEnemyOnContact"

export default function (engine: Engine, spawner: Entity, position: Position) {
  const entity = engine.createEntity()

  const body = new Body()
  body.material.elasticity = 0.8
  body.globalForceFactor = 1
  body.maxScalarVelocity = 0
  body.maxVelocity.setTo(200, 1500)
  body.isBullet = true

  engine.addComponentsToEntity(entity, [
    new Enemy(),
    position,
    new Extents(26, 27),
    new PhysicsCollision(false, null as any, []),
    new PhysicsBody(body, true),
    new Graphics("boss-bouncy"),
    new GraphicsAnimation("boss-bouncy", "idle"),
    new Moveable(),
    new Active(),
    new Health({
      max: 32,
      receiveDamageDurationMillis: 100,
      deathAction: createExplodeBurst8,
    }),
    new DamagesPlayerOnContact({ amount: 10 }),
    new PlayerAware(),
    new FollowsPlayer({
      lookX: true,
      lookHysteresis: GZE.tileSize * 2,
    }),
    new States("idle", {
      idle: { minDuration: 100, maxDuration: 100, then: "squat1" },
      shootHigh1: {
        startAction: shootHigh,
        animation: "shootHigh",
        maxDuration: 300,
        then: "shootMid1",
      },
      shootMid1: {
        startAction: shootMid,
        animation: "shootMid",
        maxDuration: 300,
        then: "shootLow1",
      },
      shootLow1: {
        startAction: shootLow,
        animation: "shootLow",
        maxDuration: 300,
        then: "shootHigh2",
      },
      shootHigh2: {
        startAction: shootHigh,
        animation: "shootHigh",
        maxDuration: 300,
        then: "shootMid2",
      },
      shootMid2: {
        startAction: shootMid,
        animation: "shootMid",
        maxDuration: 300,
        then: "shootLow2",
      },
      shootLow2: {
        startAction: shootLow,
        animation: "shootLow",
        maxDuration: 300,
        then: "idle",
      },
      squat1: {
        maxDuration: 300,
        then: "squat2",
      },
      squat2: {
        maxDuration: 300,
        waitUntilSlowerThan: 1,
        then: "jump",
      },
      jump: {
        startAction: jumpUp,
        maxDuration: 300,
        waitUntilSlowerThan: 0.8,
        then: "shootHigh1",
      },
    }),
  ])

  return entity
}

function shootHigh(engine: Engine, boss: Entity, position: Position) {
  const startPosition = position.clone()
  startPosition.coords.x += 34 * position.direction.x
  startPosition.coords.y -= 30
  createShootBall(engine, boss, startPosition, { angleDegrees: 45 })
}

function shootMid(engine: Engine, boss: Entity, position: Position) {
  const startPosition = position.clone()
  startPosition.coords.x += 40 * position.direction.x
  startPosition.coords.y -= 10
  createShootBall(engine, boss, startPosition, { angleDegrees: 0 })
}

function shootLow(engine: Engine, boss: Entity, position: Position) {
  const startPosition = position.clone()
  startPosition.coords.x += 40 * position.direction.x
  startPosition.coords.y += 16
  createShootBall(engine, boss, startPosition, { angleDegrees: -45 })
}

function jumpUp(engine: Engine, boss: Entity, position: Position) {
  const physicsBody = engine.getComponentForEntity(boss, PhysicsBody)
  if (!physicsBody) return

  physicsBody.body.velocity.y = -Infinity
  physicsBody.body.velocity.x = Infinity * position.direction.x
}

function createShootBall(
  engine: Engine,
  entity: Entity,
  position: Position,
  opts?: {
    shotSpeed?: number
    damageAmount?: number
    angleDegrees?: number
  },
) {
  const shotDir = position.direction.x
  const shotSpeed = 300
  const damageAmount = 5
  const angleRadians = opts?.angleDegrees
    ? opts.angleDegrees * (Math.PI / 180)
    : 0

  const body = new Body()
  body.material.elasticity = 1
  body.globalForceFactor = 0
  body.maxScalarVelocity = 0
  body.maxVelocity.setTo(shotSpeed, shotSpeed)
  body.velocity.x = shotSpeed * Math.cos(-angleRadians) * shotDir
  body.velocity.y = shotSpeed * Math.sin(-angleRadians)
  body.isBullet = true

  engine.addComponentsToEntity(engine.createEntity(), [
    position.clone(),
    new Extents(6, 6),
    new Graphics("power-bouncy"),
    new GraphicsAnimation("power-bouncy", "mid"),
    new PhysicsBody(body, true),
    new PhysicsCollision(false, null as any, []),
    new DamagesPlayerOnContact({ amount: damageAmount, absorb: true }),
    new DamagesEnemyOnContact("bullet", 0),
    new Moveable(),
    new Active(),
  ])
}
