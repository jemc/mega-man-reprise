import { AnimationSystem } from "glaze/graphics/systems/AnimationSystem"
import { AnimationController } from "glaze/graphics/animation/AnimationController"
import { Animation } from "glaze/graphics/animation/Animaton"

import GraphicsAnimation from "../components/GraphicsAnimation"

// Override the `play` method to have an additional parameter that dictates
// whether changing to the new animation should reset time or not.
declare module "glaze/graphics/animation/AnimationController" {
  interface AnimationController {
    play(animation: Animation, shouldNotResetTime?: boolean): void
  }
}
AnimationController.prototype.play = function play(
  animation: Animation,
  shouldNotResetTime: boolean = false,
) {
  this.animation = animation

  if (shouldNotResetTime) {
    // Don't reset time, but ensure the frame index isn't exceeding
    // the length of the new animation.
    this.frameIndex %= animation.frames.length
  } else {
    // Otherwise, reset time and the frame index.
    this.frameIndex = 0
    this.accumulatedTime = 0
  }
}

// Monkey-patch the AnimationSystem class to use the new `play` method.
AnimationSystem.prototype.playAnimation = function playAnimation(
  graphicsAnimation: GraphicsAnimation,
) {
  const { frameListId, animationId } = graphicsAnimation
  const animation = this["frameListManager"]
    ?.getFrameList(frameListId)
    ?.getAnimation(animationId)

  if (!animation)
    throw new Error(`Animation not found: ${frameListId} ${animationId}`)

  graphicsAnimation.dirty = false
  graphicsAnimation.animationController.play(
    animation,
    graphicsAnimation.shouldNotResetTime,
  )
}

export default AnimationSystem
