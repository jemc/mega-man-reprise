import { Entity } from "glazejs/src/glaze/ecs/Entity"
import { Position } from "glazejs/src/glaze/core/components/Position"
import { Vector2 } from "glazejs/src/glaze/geom/Vector2"

export default class PlayerAware {
  player?: Entity
  playerPosition?: Position
  playerOffset = new Vector2(-Infinity, -Infinity)
}
