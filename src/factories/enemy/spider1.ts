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
import Climber from "../../components/Climber"

export default function (engine: Engine, spawner: Entity, position: Position) {
  const entity = engine.createEntity()

  const body = new Body()
  body.maxScalarVelocity = 0
  body.maxVelocity.setTo(100, 630)

  engine.addComponentsToEntity(entity, [
    new Enemy(),
    position,
    new Extents(16, 10),
    new PhysicsCollision(false, null as any, []),
    new PhysicsBody(body, true),
    new Graphics("spider1"),
    new GraphicsAnimation("spider1", "walk"),
    new Moveable(),
    new Active(),
    new Health({
      max: 3,
      receiveDamageDurationMillis: 100,
      deathAction: createExplodeSimple,
    }),
    new DamagesPlayerOnContact({ amount: 10 }),
    new Climber({
      climbSpeed: 100,
      climbAnimation: "climb",
    }),
    new PlayerAware(),
    new FollowsPlayer({
      lookX: true,
      lookHysteresis: GZE.tileSize * 2,
      walkX: true,
      walkHysteresis: GZE.tileSize,
      climbY: true,
      climbHysteresis: GZE.tileSize * 1.5,
    }),
  ])

  return entity
}

function shootAction(engine: Engine, enemy: Entity, position: Position) {
  ;[-45, 0, 45].forEach((angleDegrees) => {
    createShootBullet(engine, enemy, position.clone(), { angleDegrees })
  })
}
