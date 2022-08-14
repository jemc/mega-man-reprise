import { GraphicsAnimation } from "glaze/graphics/components/GraphicsAnimation"

// Extend the original play method to take an optional options parameter,
// which allows the new extended properties to be influenced.
declare module "glaze/graphics/components/GraphicsAnimation" {
  interface GraphicsAnimation {
    play(animationId: string, opts?: { shouldNotResetTime?: boolean }): void
    // When true, changing to another animation will not reset to the start of it.
    shouldNotResetTime: boolean
  }
}
GraphicsAnimation.prototype.play = function play(
  animationId: string,
  opts?: { shouldNotResetTime?: boolean },
) {
  if (this.animationId === animationId) return
  this.animationId = animationId
  this.dirty = true
  this.shouldNotResetTime = opts?.shouldNotResetTime ?? false
}

export default GraphicsAnimation
