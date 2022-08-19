import { Entity } from "glaze/ecs/Entity"
import { System } from "glaze/ecs/System"
import { Position } from "glaze/core/components/Position"
import { Active } from "glazejs/src/glaze/core/components/Active"

import FollowsPlayer from "../components/FollowsPlayer"
import PlayerAware from "../components/PlayerAware"

export default class FollowsPlayerSystem extends System {
  constructor() {
    super([FollowsPlayer, PlayerAware, Position, Active])
  }

  updateEntity(
    entity: Entity,
    followsPlayer: FollowsPlayer,
    playerAware: PlayerAware,
    position: Position,
    active: Active,
  ) {
    const { lookX, lookHysteresis } = followsPlayer.config
    const { playerOffset } = playerAware

    if (lookX) {
      if (playerOffset.x > (lookHysteresis ?? 0)) {
        position.direction.x = 1
      } else if (playerOffset.x < -(lookHysteresis ?? 0)) {
        position.direction.x = -1
      }
    }
  }
}
