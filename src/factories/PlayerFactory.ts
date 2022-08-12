import { Engine } from "glaze/ecs/Engine"
import { Entity } from "glaze/ecs/Entity"
import { Filter } from "glaze/physics/collision/Filter"
import { Body } from "glaze/physics/Body"
import { Material } from "glaze/physics/Material"
import { Extents } from "glaze/core/components/Extents"
import { Graphics } from "glaze/graphics/components/Graphics"
import { GraphicsAnimation } from "glaze/graphics/components/GraphicsAnimation"
import { PhysicsBody } from "glaze/physics/components/PhysicsBody"
import { PhysicsCollision } from "glaze/physics/components/PhysicsCollision"
import { Moveable } from "glaze/core/components/Moveable"
import { Active } from "glaze/core/components/Active"
import { Position } from "glaze/core/components/Position"

import { TestFilters } from "glaze/../test/config/Filters"

import { Player } from "../components/Player"

export class PlayerFactory {
  static create(engine: Engine, position: Position): Entity {
    const playerFilter = new Filter()
    playerFilter.categoryBits = TestFilters.PLAYER_CAT
    playerFilter.groupIndex = TestFilters.PLAYER_GROUP

    const body = new Body(new Material(1, 0.3, 0.5))
    body.maxScalarVelocity = 0
    body.maxVelocity.setTo(160, 630)

    const extents = new Extents(11, 22)

    const player = engine.createEntity()
    engine.addComponentsToEntity(player, [
      new Player(),
      position,
      extents,
      new Graphics("etude"),
      new GraphicsAnimation("etude", "idle"),
      new PhysicsBody(body, true),
      new PhysicsCollision(false, playerFilter, []),
      new Moveable(),
      new Active(),
    ])

    return player
  }
}
