import { Entity } from "glaze/ecs/Entity"
import { System } from "glaze/ecs/System"
import { Active } from "glazejs/src/glaze/core/components/Active"
import { Extents } from "glazejs/src/glaze/core/components/Extents"
import { Graphics } from "glazejs/src/glaze/graphics/components/Graphics"

import ExtentsFollowSpriteExtents from "../components/ExtentsFollowSpriteExtents"
import { SpriteTexture } from "glazejs/src/glaze/graphics/texture/SpriteTexture"
import { PhysicsBody } from "glazejs/src/glaze/physics/components/PhysicsBody"
import { PhysicsCollision } from "glazejs/src/glaze/physics/components/PhysicsCollision"
import { Position } from "glazejs/src/glaze/core/components/Position"
import { Vector2 } from "glazejs/src/glaze/geom/Vector2"

export default class ExtentsFollowSpriteExtentsSystem extends System {
  constructor() {
    super([ExtentsFollowSpriteExtents, Graphics, Extents, Position, Active])
  }

  updateEntity(
    entity: Entity,
    extentsFollowSpriteExtents: ExtentsFollowSpriteExtents,
    graphics: Graphics,
    extents: Extents,
    position: Position,
    active: Active,
  ) {
    const { marginX, marginY } = extentsFollowSpriteExtents.config
    const { frame, pivot } = graphics.sprite.texture as SpriteTexture
    const { scale } = graphics.sprite

    extents.halfWidths.setTo(
      0.5 * scale.x * frame.width - (marginX ?? 0),
      0.5 * scale.y * frame.height - (marginY ?? 0),
    )
    const offsetX = scale.x * frame.width * pivot.x
    const offsetY = scale.y * frame.height * pivot.y

    if (extentsFollowSpriteExtents.lastOffset) {
      const { lastOffset: lastOffset } = extentsFollowSpriteExtents
      const movedOffsetX = lastOffset.x - offsetX
      const movedOffsetY = lastOffset.y - offsetY
      position.coords.setTo(
        position.coords.x + movedOffsetX,
        position.coords.y + movedOffsetY,
      )

      const physicsCollision: PhysicsCollision | undefined =
        this.engine.getComponentForEntity(entity, PhysicsCollision)
      if (physicsCollision) {
        const { aabb } = physicsCollision.proxy
        aabb.extents.copy(extents.halfWidths)
        aabb.position.setTo(
          aabb.position.x + movedOffsetX,
          aabb.position.y + movedOffsetY,
        )
      }
      extentsFollowSpriteExtents.lastOffset.setTo(offsetX, offsetY)
    } else {
      extentsFollowSpriteExtents.lastOffset = new Vector2(offsetX, offsetY)
    }
  }
}
