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

export default function (engine: Engine, position: Position) {
  const entity = engine.createEntity()

  const body = new Body()
  body.maxScalarVelocity = 0
  body.maxVelocity.setTo(100, 630)

  engine.addComponentsToEntity(entity, [
    new Enemy(),
    position,
    new Extents(16, 12),
    new PhysicsCollision(false, null as any, []),
    new PhysicsBody(body, true),
    new Graphics("met1"),
    new GraphicsAnimation("met1", "idle"),
    new Moveable(),
    new Active(),
    new Health({ max: 1, receiveDamageDurationMillis: 100, deathAction }),
    new DamagesPlayerOnContact(10),
    new PlayerAware(),
    new FollowsPlayer({
      lookX: true,
      lookHysteresis: GZE.tileSize * 2,
    }),
    new States("idle", {
      idle: { minDuration: 2000, deflectsBullets: true },
      opening: { maxDuration: 300, then: "open" },
      open: { maxDuration: 500, then: "closing", startAction: shootAction },
      closing: { maxDuration: 300, then: "idle" },
    }),
    new ChangesStatesOnPlayerProximity({
      from: "idle",
      to: "opening",
      proximityX: GZE.tileSize * 9,
      proximityY: GZE.tileSize * 4,
      delay: 500,
    }),
  ])

  return entity
}

function deathAction(engine: Engine, entity: Entity, position: Position) {
  const body = new Body()
  body.isBullet = true
  body.maxScalarVelocity = 0
  body.globalForceFactor = 0
  body.maxVelocity.setTo(0, 0)

  engine.addComponentsToEntity(engine.createEntity(), [
    position.clone(),
    new Graphics("explode"),
    new GraphicsAnimation("explode", "main"),
    new Active(),
    new States("main", {
      main: { maxDuration: 400, then: "destroy" },
    }),
  ])
}

function shootAction(engine: Engine, enemy: Entity, position: Position) {
  const shotSpeed = 300
  const shotDir = position.direction.x

  for (let i = 0; i < 3; i++) {
    const body = new Body()
    body.globalForceFactor = 0
    body.maxScalarVelocity = 0
    body.maxVelocity.setTo(shotSpeed, shotSpeed)
    body.velocity.x = shotSpeed * Math.sin(((i + 1) * Math.PI) / 4) * shotDir
    body.velocity.y = shotSpeed * Math.cos(((i + 1) * Math.PI) / 4)
    body.isBullet = true

    engine.addComponentsToEntity(engine.createEntity(), [
      position.clone(),
      new Extents(4, 4),
      new Graphics("met1-shot"),
      new GraphicsAnimation("met1-shot", "main"),
      new PhysicsBody(body, true),
      new PhysicsCollision(true, null as any, []),
      new DamagesPlayerOnContact(5),
      new Moveable(),
      new Active(),
    ])
  }
}
