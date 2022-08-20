import { Entity } from "glaze/ecs/Entity"
import { System } from "glaze/ecs/System"
import { Position } from "glazejs/src/glaze/core/components/Position"
import { Active } from "glazejs/src/glaze/core/components/Active"

import States from "../components/States"
import GraphicsAnimation from "../components/GraphicsAnimation"

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
    const { maxDuration, then } = states.config[states.current]!

    if (maxDuration && then && timeSoFar >= maxDuration) {
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
