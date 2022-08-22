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
import createShootBullet from "../projectile/createShootBullet"

export default function (engine: Engine, position: Position) {
  const entity = engine.createEntity()

  const body = new Body()
  body.maxScalarVelocity = 0
  body.maxVelocity.setTo(100, 630)

  engine.addComponentsToEntity(entity, [
    new Enemy(),
    position,
    new Extents(14, 26),
    new PhysicsCollision(false, null as any, []),
    new PhysicsBody(body, true),
    new Graphics("catapult"),
    new GraphicsAnimation("catapult", "idle"),
    new Moveable(),
    new Active(),
    new Health({
      max: 7,
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
      idle: { minDuration: 800 },
      "pre-shoot": { maxDuration: 200, then: "shoot" },
      shoot: { maxDuration: 500, then: "reload", startAction: shootAction },
      reload: { maxDuration: 250, then: "idle" },
    }),
    new ChangesStatesOnPlayerProximity({
      from: "idle",
      to: "pre-shoot",
      proximityX: GZE.tileSize * 25,
      proximityY: GZE.tileSize * 8,
      delay: 0,
    }),
  ])

  return entity
}

function shootAction(engine: Engine, entity: Entity, position: Position) {
  const { playerPosition } = engine.getComponentForEntity(entity, PlayerAware)!

  createShootBullet(
    engine,
    entity,
    new Position(
      position.coords.x + 14 * position.direction.x,
      position.coords.y - 32,
      position.direction.x,
    ),
    {
      targetForAngle: playerPosition?.coords,
    },
  )
}
