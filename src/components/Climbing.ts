import { Entity } from "glazejs/src/glaze/ecs/Entity"
import { Position } from "glazejs/src/glaze/core/components/Position"
import { Extents } from "glazejs/src/glaze/core/components/Extents"
import { Vector2 } from "glazejs/src/glaze/geom/Vector2"
import { GZE } from "glazejs/src/glaze/GZE"

// The Climbing component is attached to anything that is currently climbing.
export default class Climbing {
  // The entity currently being climbed, and its position and extents.
  climbable: [Entity, Position, Extents]
  constructor(climbable: [Entity, Position, Extents]) {
    this.climbable = climbable
  }

  // The climber's offset from the center of the entity being climbed.
  //
  // Tracking this in a relative rather than absolute position enables
  // possibilities like a moving climbable ladder, where the climber's absolute
  // position can change even if not climbing up or down (no offset change).
  offset = new Vector2(0, 0)

  // The absolute X coordinate of the climber.
  get absoluteX() {
    return this.climbable[1].coords.x + this.offset.x
  }

  // The absolute Y coordinate of the climber.
  get absoluteY() {
    return this.climbable[1].coords.y + this.offset.y
  }

  // True when the climber's center is beyond the top edge of the climbable.
  // (this often means their bottom part is still barely on the climbable).
  get isNearTheTop() {
    return this.offset.y < -this.climbable[2].halfWidths.y
  }

  // True when the climber's entire extents are above the climbable's extents.
  isOffTheTop(climberExtents: Extents) {
    return (
      this.offset.y <
      -this.climbable[2].halfWidths.y - climberExtents.halfWidths.y
    )
  }

  // True when the nearly all the climber's extents are below the climbable.
  // We do "nearly" so that we target the "last rung" of a ladder-like object.
  isOffTheBottom(climberExtents: Extents) {
    return (
      this.offset.y >
      this.climbable[2].halfWidths.y +
        climberExtents.halfWidths.y -
        GZE.tileSize / 2
    )
  }
}
