import { Entity } from "glaze/ecs/Entity"
import { System } from "glaze/ecs/System"
import { Camera } from "glazejs/src/glaze/graphics/displaylist/Camera"
import { DisplayObjectContainer } from "glazejs/src/glaze/graphics/displaylist/DisplayObjectContainer"
import { Graphics } from "glazejs/src/glaze/graphics/components/Graphics"
import { Active } from "glazejs/src/glaze/core/components/Active"

import HUDPositioning from "../components/HUDPositioning"

export default class HUDPositioningSystem extends System {
  container: HUDContainer

  constructor(camera: Camera) {
    super([HUDPositioning, Graphics, Active])
    this.container = new HUDContainer()
    camera.addChild(this.container)
  }

  updateEntity(
    entity: Entity,
    hudPositioning: HUDPositioning,
    graphics: Graphics,
    active: Active,
  ) {
    if (graphics.sprite.parent !== this.container)
      this.container.addChild(graphics.sprite)
  }
}

class HUDContainer extends DisplayObjectContainer {
  constructor() {
    super()
    this.id = "HUD"
    this.worldAlpha = this.alpha
  }

  public updateTransform() {
    // Update this container's local transform to counteract the parent's
    // world transform, thus nullifying any 2D translation effects.
    //
    // TODO: Do we need to also account for any possible scaling/skew effects
    // in the other indices of the parent's world transform?
    this.localTransform[2] = -this.parent.worldTransform[2]!
    this.localTransform[5] = -this.parent.worldTransform[5]!

    // Let the children update their own transforms as normal for this method.
    for (let child = this.head; child; child = child.next) {
      child.updateTransform()
    }
  }
}
