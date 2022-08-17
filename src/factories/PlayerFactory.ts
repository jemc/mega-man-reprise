import { Engine } from "glaze/ecs/Engine"
import { Entity } from "glaze/ecs/Entity"
import { Filter } from "glaze/physics/collision/Filter"
import { Body } from "glaze/physics/Body"
import { Material } from "glaze/physics/Material"
import { Extents } from "glaze/core/components/Extents"
import { Graphics } from "glaze/graphics/components/Graphics"
import { PhysicsBody } from "glaze/physics/components/PhysicsBody"
import { PhysicsCollision } from "glaze/physics/components/PhysicsCollision"
import { Moveable } from "glaze/core/components/Moveable"
import { Active } from "glaze/core/components/Active"
import { Position } from "glaze/core/components/Position"

import { TestFilters } from "glaze/../test/config/Filters"

import { Player } from "../components/Player"
import Climber from "../components/Climber"
import GraphicsAnimation from "../components/GraphicsAnimation"

export default class PlayerFactory {
  static create(engine: Engine, entity: Entity, position: Position): Entity {
    const playerFilter = new Filter()
    playerFilter.categoryBits = TestFilters.PLAYER_CAT
    playerFilter.groupIndex = TestFilters.PLAYER_GROUP

    const player = new Player({
      height: 22,
      width: 11,
      maxVerticalSpeed: 630,
      maxSlideSpeed: 308,
      maxWalkSpeed: 160,
      minWalkSpeed: 50,
      maxStepSpeed: 70,
      stepForce: 0.1,
      walkForce: 10,
      slideForce: 100,
      slideDurationMillis: 500,
      stopFriction: 0.2,
    })

    const body = new Body(new Material(1, 0.3, player.config.stopFriction))
    body.maxScalarVelocity = 0

    const extents = new Extents(player.config.width, player.config.height)

    engine.addComponentsToEntity(entity, [
      player,
      position,
      extents,
      new Graphics("etude"),
      new GraphicsAnimation("etude", "idle"),
      new PhysicsBody(body, true),
      new PhysicsCollision(false, playerFilter, []),
      new Moveable(),
      new Active(),
      new Climber({
        climbSpeed: 160,
      }),
    ])

    return entity
  }
}
