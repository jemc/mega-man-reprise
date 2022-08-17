import { Entity } from "glaze/ecs/Entity"
import { System } from "glaze/ecs/System"
import { Position } from "glaze/core/components/Position"

import FollowsPlayer from "../components/FollowsPlayer"
import PlayerAware from "../components/PlayerAware"
import { BitVector } from "glazejs/src/glaze/ds/BitVector"
import { Engine } from "glazejs/src/glaze/ecs/Engine"

export default class FollowsPlayerSystem extends System {
  constructor() {
    super([FollowsPlayer, PlayerAware, Position])
  }

  onEntityAdded(
    entity: Entity,
    followsPlayer: FollowsPlayer,
    playerAware: PlayerAware,
    position: Position,
  ) {}

  updateEntity(
    entity: Entity,
    followsPlayer: FollowsPlayer,
    playerAware: PlayerAware,
    position: Position,
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
