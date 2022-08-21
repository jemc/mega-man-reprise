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
import ChangesStatesOnPlayerProximity from "../../components/ChangesStatesOnPlayerProximity"
import createExplodeSimple from "../projectile/createExplodeSimple"

export default function (engine: Engine, position: Position) {
  const entity = engine.createEntity()

  const body = new Body()
  body.maxScalarVelocity = 0
  body.maxVelocity.setTo(100, 630)

  engine.addComponentsToEntity(entity, [
    new Enemy(),
    position,
    new Extents(4, 16),
    new PhysicsCollision(false, null as any, []),
    new PhysicsBody(body, true),
    new Graphics("turret1"),
    new GraphicsAnimation("turret1", "idle"),
    new Moveable(),
    new Active(),
    new Health({
      max: 3,
      receiveDamageDurationMillis: 100,
      deathAction: createExplodeSimple,
    }),
    new DamagesPlayerOnContact(15),
    new PlayerAware(),
    new FollowsPlayer({
      lookX: true,
      lookHysteresis: GZE.tileSize * 2,
    }),
    new States("idle", {
      idle: {},
      shoot: { maxDuration: 200, then: "cooldown", startAction: shootAction },
      cooldown: { maxDuration: 700, then: "idle", animation: "idle" },
    }),
    new ChangesStatesOnPlayerProximity({
      from: "idle",
      to: "shoot",
      proximityX: GZE.tileSize * 25,
      proximityY: GZE.tileSize * 3,
      delay: 0,
    }),
  ])

  return entity
}

function shootAction(engine: Engine, enemy: Entity, position: Position) {
  const shotSpeed = 300
  const shotDir = position.direction.x

  const body = new Body()
  body.globalForceFactor = 0
  body.maxScalarVelocity = 0
  body.maxVelocity.setTo(shotSpeed, shotSpeed)
  body.velocity.x = shotSpeed * shotDir
  body.isBullet = true

  engine.addComponentsToEntity(engine.createEntity(), [
    new Position(
      position.coords.x + 14 * shotDir,
      position.coords.y - 10,
      shotDir,
    ),
    new Extents(4, 4),
    new Graphics("shot"),
    new GraphicsAnimation("shot", "bullet"),
    new PhysicsBody(body, true),
    new PhysicsCollision(true, null as any, []),
    new DamagesPlayerOnContact(5),
    new Moveable(),
    new Active(),
  ])
}
