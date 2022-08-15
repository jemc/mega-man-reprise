import { Entity } from "glaze/ecs/Entity"
import { System } from "glaze/ecs/System"
import { Position } from "glaze/core/components/Position"
import { Extents } from "glaze/core/components/Extents"
import { PhysicsCollision } from "glaze/physics/components/PhysicsCollision"

import Climbable from "../components/Climbable"
import Climber from "../components/Climber"

export default class LadderSystem extends System {
  constructor() {
    super([Climbable, Position, Extents, PhysicsCollision])
  }

  onEntityAdded(
    entity: Entity,
    climbable: Climbable,
    position: Position,
    extents: Extents,
    physicsCollision: PhysicsCollision,
  ) {
    physicsCollision.proxy.contactCallbacks.push(
      (ladderProxy, otherProxy, contact) => {
        const climber: Climber | null = this.engine.getComponentForEntity(
          otherProxy.entity,
          Climber,
        )
        if (climber)
          climber.nearClimbable = [ladderProxy.entity, position, extents]
      },
    )
  }

  updateEntity(
    entity: Entity,
    climbable: Climbable,
    position: Position,
    extents: Extents,
    physicsCollision: PhysicsCollision,
  ) {}
}
