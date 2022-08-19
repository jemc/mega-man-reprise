import { Entity } from "glaze/ecs/Entity"
import { System } from "glaze/ecs/System"
import { Position } from "glaze/core/components/Position"
import { Extents } from "glaze/core/components/Extents"
import { PhysicsCollision } from "glaze/physics/components/PhysicsCollision"
import { Active } from "glazejs/src/glaze/core/components/Active"

import Climbable from "../components/Climbable"
import Climber from "../components/Climber"

export default class ClimbableSystem extends System {
  constructor() {
    super([Climbable, Position, Extents, PhysicsCollision, Active])
  }

  onEntityAdded(
    entity: Entity,
    climbable: Climbable,
    position: Position,
    extents: Extents,
    physicsCollision: PhysicsCollision,
    active: Active,
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
