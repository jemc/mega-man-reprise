import { Entity } from "glaze/ecs/Entity"
import { System } from "glaze/ecs/System"
import { Position } from "glazejs/src/glaze/core/components/Position"
import { Active } from "glazejs/src/glaze/core/components/Active"

import States from "../components/States"
import GraphicsAnimation from "../components/GraphicsAnimation"
import { Engine } from "glazejs/src/glaze/ecs/Engine"
import { PhysicsBody } from "glazejs/src/glaze/physics/components/PhysicsBody"

export default class StatesGraphicsSystem extends System {
  constructor() {
    super([States, Position, GraphicsAnimation, Active])
  }

  updateEntity(
    entity: Entity,
    states: States,
    position: Position,
    animation: GraphicsAnimation,
    active: Active,
  ) {
    const timeSoFar = states.timeSoFar + this.dt
    const { maxDuration, waitUntilSlowerThan, then } =
      states.config[states.current]!

    if (
      maxDuration &&
      then &&
      timeSoFar >= maxDuration &&
      (waitUntilSlowerThan
        ? isSlowerThan(waitUntilSlowerThan, this.engine, entity)
        : true)
    ) {
      if (then === "destroy") {
        this.engine.destroyEntity(entity)
      } else {
        states.changeTo(then)

        const { startAction } = states.config[states.current]!
        if (startAction) startAction(this.engine, entity, position.clone())
      }
    } else {
      states.timeSoFar = timeSoFar
    }

    animation.play(states.currentAnimation)
  }
}

function isSlowerThan(threshold: number, engine: Engine, entity: Entity) {
  const physicsBody = engine.getComponentForEntity(entity, PhysicsBody)
  if (!physicsBody) return false

  return (
    Math.abs(
      physicsBody.body.position.x - physicsBody.body.previousPosition.x,
    ) < threshold &&
    Math.abs(
      physicsBody.body.position.y - physicsBody.body.previousPosition.y,
    ) < threshold
  )
}
