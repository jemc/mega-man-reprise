import { Entity } from "glaze/ecs/Entity"
import { System } from "glaze/ecs/System"
import { Position } from "glaze/core/components/Position"

import PlayerAware from "../components/PlayerAware"
import { Active } from "glazejs/src/glaze/core/components/Active"

export default class PlayerAwareSystem extends System {
  private player: Entity
  private playerPosition: Position

  constructor(player: Entity, playerPosition: Position) {
    super([PlayerAware, Position, Active])
    this.player = player
    this.playerPosition = playerPosition
  }

  onEntityAdded(
    entity: Entity,
    playerAware: PlayerAware,
    position: Position,
    active: Active,
  ) {
    playerAware.player = this.player
    playerAware.playerPosition = this.playerPosition
    playerAware.playerOffset.setTo(
      this.playerPosition.coords.x - position.coords.x,
      this.playerPosition.coords.y - position.coords.y,
    )
  }

  updateEntity(
    entity: Entity,
    playerAware: PlayerAware,
    position: Position,
    active: Active,
  ) {
    playerAware.playerOffset.setTo(
      this.playerPosition.coords.x - position.coords.x,
      this.playerPosition.coords.y - position.coords.y,
    )
  }
}
