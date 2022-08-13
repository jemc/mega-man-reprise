import { AnimationSystem as OriginalAnimationSystem } from "glaze/graphics/systems/AnimationSystem"
import { AnimationController as OriginalAnimationController } from "glaze/graphics/animation/AnimationController"
import { Animation } from "glaze/graphics/animation/Animaton"
import { Entity } from "glaze/ecs/Entity"
import { Position } from "glaze/core/components/Position"
import { Graphics } from "glaze/graphics/components/Graphics"

import GraphicsAnimation from "../components/GraphicsAnimation"

export class AnimationSystem extends OriginalAnimationSystem {
  private getAnimation(graphicsAnimation: GraphicsAnimation): Animation {
    const animation = this["frameListManager"]
      ?.getFrameList(graphicsAnimation.frameListId)
      ?.getAnimation(graphicsAnimation.animationId)

    if (!animation)
      throw new Error(
        `Animation not found: ${graphicsAnimation.frameListId} ${graphicsAnimation.animationId}`,
      )

    return animation
  }

  // Extend `onEntityAdded` to set the new `AnimationController` class.
  onEntityAdded(
    entity: Entity,
    position: Position,
    graphics: Graphics,
    graphicsAnimation: GraphicsAnimation,
  ) {
    graphicsAnimation.dirty = false
    graphicsAnimation["animationController"] = new AnimationController(
      this.getAnimation(graphicsAnimation),
    )
  }

  // Extend the `playAnimation` method to also pass the new
  // `shouldNotResetTime` parameter to the animation controller,
  // and to use the new class for the animation controller.
  playAnimation(graphicsAnimation: GraphicsAnimation) {
    graphicsAnimation.dirty = false
    ;(graphicsAnimation.animationController as AnimationController).play(
      this.getAnimation(graphicsAnimation),
      graphicsAnimation.shouldNotResetTime,
    )
  }
}

export class AnimationController extends OriginalAnimationController {
  // Extend the play method to add another parameter that dictates whether
  // changing to the new animation should reset time or not.
  public play(animation: Animation, shouldNotResetTime: boolean = false) {
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
}
