import { Engine } from "glazejs/src/glaze/ecs/Engine"
import { Entity } from "glaze/ecs/Entity"
import { System } from "glaze/ecs/System"
import { Position } from "glaze/core/components/Position"

import PlayerAware from "../components/PlayerAware"
import { Vector2 } from "glazejs/src/glaze/geom/Vector2"
import { BitVector } from "glazejs/src/glaze/ds/BitVector"

export default class PlayerAwareSystem extends System {
  private player: Entity
  private playerPosition!: Position

  constructor(player: Entity) {
    super([PlayerAware, Position])
    this.player = player
  }

  onAddedToEngine(engine: Engine, matchMask: BitVector) {
    this.engine = engine
    this.matchMask = matchMask
    this.playerPosition = engine.getComponentForEntity(this.player, Position)
  }

  onEntityAdded(entity: Entity, playerAware: PlayerAware, position: Position) {
    playerAware.player = this.player
    playerAware.playerPosition = this.playerPosition
    playerAware.playerOffset.setTo(
      this.playerPosition.coords.x - position.coords.x,
      this.playerPosition.coords.y - position.coords.y,
    )
  }

  updateEntity(entity: Entity, playerAware: PlayerAware, position: Position) {
    playerAware.playerOffset.setTo(
      this.playerPosition.coords.x - position.coords.x,
      this.playerPosition.coords.y - position.coords.y,
    )
  }
}
