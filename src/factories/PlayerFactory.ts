import { Engine } from "glazejs/src/glaze/ecs/Engine"
import { Entity } from "glazejs/src/glaze/ecs/Entity"
import { Filter } from "glazejs/src/glaze/physics/collision/Filter"
import { TestFilters } from "glazejs/src/test/config/Filters"
import { Body } from "glazejs/src/glaze/physics/Body"
import { Material } from "glazejs/src/glaze/physics/Material"
import { Extents } from "glazejs/src/glaze/core/components/Extents"
import { Graphics } from "glazejs/src/glaze/graphics/components/Graphics"
import { GraphicsAnimation } from "glazejs/src/glaze/graphics/components/GraphicsAnimation"
import { PhysicsBody } from "glazejs/src/glaze/physics/components/PhysicsBody"
import { PhysicsCollision } from "glazejs/src/glaze/physics/components/PhysicsCollision"
import { Moveable } from "glazejs/src/glaze/core/components/Moveable"
import { Active } from "glazejs/src/glaze/core/components/Active"
import { Position } from "glazejs/src/glaze/core/components/Position"

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
