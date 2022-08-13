import { GraphicsAnimation as OriginalGraphicsAnimation } from "glaze/graphics/components/GraphicsAnimation"

export default class GraphicsAnimation extends OriginalGraphicsAnimation {
  // Extend the original component by adding the following new property:

  // When true, changing to another animation will not reset to the start of it.
  shouldNotResetTime = false

  // Extend the original play method to take an optional options parameter,
  // which allows the new extended properties to be influenced.
  play(animationId: string, opts?: { shouldNotResetTime?: boolean }) {
    if (this.animationId === animationId) return
    this.animationId = animationId
    this.dirty = true
    this.shouldNotResetTime = opts?.shouldNotResetTime ?? false
  }
}
