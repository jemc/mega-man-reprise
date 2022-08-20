import { Entity } from "glaze/ecs/Entity"
import { System } from "glaze/ecs/System"
import { Active } from "glazejs/src/glaze/core/components/Active"

import ChangesStatesOnPlayerProximity from "../components/ChangesStatesOnPlayerProximity"
import States from "../components/States"
import PlayerAware from "../components/PlayerAware"
import { Position } from "glazejs/src/glaze/core/components/Position"

export default class ChangesStatesOnPlayerProximitySystem extends System {
  constructor() {
    super([
      ChangesStatesOnPlayerProximity,
      States,
      Position,
      PlayerAware,
      Active,
    ])
  }

  updateEntity(
    entity: Entity,
    changes: ChangesStatesOnPlayerProximity,
    states: States,
    position: Position,
    playerAware: PlayerAware,
    active: Active,
  ) {
    const { from, to, proximityX, proximityY, delay } = changes.config
    const { playerOffset } = playerAware

    if (
      states.current === from &&
      states.hasMinDurationElapsed &&
      Math.abs(playerOffset.x) <= proximityX &&
      Math.abs(playerOffset.y) <= proximityY
    ) {
      if (delay !== undefined) {
        if (changes.timeSoFar >= delay) {
          states.changeTo(to)
          changes.timeSoFar = 0

          const { startAction } = states.config[states.current]!
          if (startAction) startAction(this.engine, entity, position.clone())
        } else {
          changes.timeSoFar += this.dt
        }
      }
    } else {
      changes.timeSoFar = 0
    }
  }
}
