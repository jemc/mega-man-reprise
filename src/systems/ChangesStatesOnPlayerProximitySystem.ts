import { Entity } from "glaze/ecs/Entity"
import { System } from "glaze/ecs/System"
import { Active } from "glazejs/src/glaze/core/components/Active"

import ChangesStatesOnPlayerProximity from "../components/ChangesStatesOnPlayerProximity"
import States from "../components/States"
import PlayerAware from "../components/PlayerAware"

export default class ChangesStatesOnPlayerProximitySystem extends System {
  constructor() {
    super([ChangesStatesOnPlayerProximity, States, PlayerAware, Active])
  }

  updateEntity(
    entity: Entity,
    changes: ChangesStatesOnPlayerProximity,
    states: States,
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
        } else {
          changes.timeSoFar += this.dt
        }
      }
    } else {
      changes.timeSoFar = 0
    }
  }
}
