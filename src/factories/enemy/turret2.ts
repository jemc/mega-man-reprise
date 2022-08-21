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
import Health from "../../components/Health"
import States from "../../components/States"
import ChangesStatesOnPlayerProximity from "../../components/ChangesStatesOnPlayerProximity"
import ExtentsFollowSpriteExtents from "../../components/ExtentsFollowSpriteExtents"
import createExplodeSimple from "../projectile/createExplodeSimple"

export default function (engine: Engine, position: Position) {
  const entity = engine.createEntity()

  const body = new Body()
  body.globalForceFactor = 0
  body.maxScalarVelocity = 0
  body.maxVelocity.setTo(100, 630)

  engine.addComponentsToEntity(entity, [
    new Enemy(),
    new Position(position.coords.x, position.coords.y + 10),
    new Extents(0, 0),
    new ExtentsFollowSpriteExtents({ marginX: 2, marginY: 0 }),
    new PhysicsCollision(false, null as any, []),
    new PhysicsBody(body, true),
    new Graphics("turret2"),
    new GraphicsAnimation("turret2", "opening"),
    new Moveable(),
    new Active(),
    new Health({
      max: 7,
      receiveDamageDurationMillis: 100,
      deathAction: createExplodeSimple,
    }),
    new DamagesPlayerOnContact(15),
    new PlayerAware(),
    new States("idle", {
      idle: {},
      opening: { maxDuration: 500, then: "open" },
      open: { maxDuration: 200, then: "closing", startAction: shootAction },
      closing: { maxDuration: 500, then: "idle" },
    }),
    new ChangesStatesOnPlayerProximity({
      from: "idle",
      to: "opening",
      proximityX: GZE.tileSize * 25,
      proximityY: GZE.tileSize * 3,
      delay: 1000,
    }),
  ])

  return entity
}

function shootAction(engine: Engine, enemy: Entity, position: Position) {
  const shotSpeed = 300
  const shotDir = position.direction.x

  for (let i = 0; i < 5; i++) {
    const body = new Body()
    body.globalForceFactor = 0
    body.maxScalarVelocity = 0
    body.maxVelocity.setTo(shotSpeed, shotSpeed)
    body.velocity.x = shotSpeed * Math.sin(((i + 2) * Math.PI) / 4) * shotDir
    body.velocity.y = shotSpeed * Math.cos(((i + 2) * Math.PI) / 4)
    body.isBullet = true

    engine.addComponentsToEntity(engine.createEntity(), [
      new Position(position.coords.x, position.coords.y - 14, shotDir),
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
}
