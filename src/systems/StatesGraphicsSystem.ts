import { Entity } from "glaze/ecs/Entity"
import { System } from "glaze/ecs/System"

import States from "../components/States"
import GraphicsAnimation from "../components/GraphicsAnimation"

export default class StatesGraphicsSystem extends System {
  constructor() {
    super([States, GraphicsAnimation])
  }

  onEntityAdded(entity: Entity, states: States, animation: GraphicsAnimation) {}

  updateEntity(entity: Entity, states: States, animation: GraphicsAnimation) {
    const timeSoFar = states.timeSoFar + this.dt
    const { maxDuration, then } = states.config[states.current]!

    if (maxDuration && then && timeSoFar >= maxDuration) {
      states.changeTo(then)
    } else {
      states.timeSoFar = timeSoFar
    }

    animation.play(states.current)
  }
}
