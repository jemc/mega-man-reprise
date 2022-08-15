import { Entity } from "glaze/ecs/Entity"
import { System } from "glaze/ecs/System"
import { Position } from "glaze/core/components/Position"
import { Extents } from "glazejs/src/glaze/core/components/Extents"
import { PhysicsBody } from "glaze/physics/components/PhysicsBody"
import { Active } from "glazejs/src/glaze/core/components/Active"

import Climbing from "../components/Climbing"
import Climber from "../components/Climber"

export default class ClimbSystem extends System {
  constructor() {
    super([Climber, Position, Extents, PhysicsBody, Active])
  }

  onEntityAdded(
    entity: Entity,
    climber: Climber,
    position: Position,
    physicsBody: PhysicsBody,
    active: Active,
  ) {}

  updateEntity(
    entity: Entity,
    climber: Climber,
    position: Position,
    extents: Extents,
    physicsBody: PhysicsBody,
    active: Active,
  ) {
    const alreadyClimbing: Climbing | null = this.engine.getComponentForEntity(
      entity,
      Climbing,
    )
    if (alreadyClimbing)
      return this.updateClimbingEntity(
        entity,
        alreadyClimbing,
        climber,
        position,
        extents,
        physicsBody,
        active,
      )

    // Otherwise, check if the climber wants to start climbing something nearby
    if (climber.wantsUp && climber.nearClimbable) {
      const [climbableEntity, climbablePosition, climbableExtents] =
        climber.nearClimbable

      // If the climbable area is too far away, we can't climb it.
      const climbOffsetX = position.coords.x - climbablePosition.coords.x
      const climbOffsetY = position.coords.y - climbablePosition.coords.y
      if (
        Math.abs(climbOffsetX) > climbableExtents.halfWidths.x ||
        Math.abs(climbOffsetY) > climbableExtents.halfWidths.y
      )
        return

      // Attach the climber to the entity it is climbing, at the right offset.
      const climbing = new Climbing(climber.nearClimbable)
      climbing.offset.setTo(0, climbOffsetY)
      this.engine.addComponentsToEntity(entity, [climbing])

      // Finish updating the climbing logic.
      return this.updateClimbingEntity(
        entity,
        climbing,
        climber,
        position,
        extents,
        physicsBody,
        active,
      )
    }
  }

  private updateClimbingEntity(
    entity: Entity,
    climbing: Climbing,
    climber: Climber,
    position: Position,
    extents: Extents,
    physicsBody: PhysicsBody,
    active: Active,
  ) {
    if (climber.wantsUp) {
      climbing.offset.y -= climber.config.climbSpeed * (this.dt / 1000)
      if (climbing.isOffTheTop(extents)) return this.cancelClimbing(entity)
    } else if (climber.wantsDown) {
      climbing.offset.y += climber.config.climbSpeed * (this.dt / 1000)
      if (climbing.isOffTheBottom(extents)) return this.cancelClimbing(entity)
    }

    const { absoluteX, absoluteY } = climbing
    physicsBody.body.setStaticPosition(absoluteX, absoluteY)
    position.update(physicsBody.body.position)
  }

  private cancelClimbing(entity: Entity) {
    this.engine.removeComponentsFromEntityByType(entity, [Climbing])
  }
}
