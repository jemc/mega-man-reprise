import { Entity } from "glaze/ecs/Entity"
import { System } from "glaze/ecs/System"
import { DigitalInput } from "glaze/util/DigitalInput"
import { TileMapCollision } from "glaze/physics/collision/broadphase/TileMapCollision"
import { Position } from "glaze/core/components/Position"
import { Extents } from "glaze/core/components/Extents"
import { PhysicsCollision } from "glaze/physics/components/PhysicsCollision"
import { PhysicsBody } from "glaze/physics/components/PhysicsBody"
import { Vector2 } from "glaze/geom/Vector2"
import { Key } from "glaze/util/Keycodes"
import { AABB2 } from "glaze/geom/AABB2"
import { GZE } from "glaze/GZE"

import { Player } from "../components/Player"
import GraphicsAnimation from "../components/GraphicsAnimation"

export class PlayerSystem extends System {
  private input: DigitalInput
  private tileMap: TileMapCollision

  constructor(input: DigitalInput, tileMap: TileMapCollision) {
    super([
      Player,
      Position,
      Extents,
      PhysicsCollision,
      PhysicsBody,
      GraphicsAnimation,
    ])
    this.input = input
    this.tileMap = tileMap
  }

  onEntityAdded(
    entity: Entity,
    player: Player,
    position: Position,
    extents: Extents,
    physicsCollision: PhysicsCollision,
    physicsBody: PhysicsBody,
    graphicsAnimation: GraphicsAnimation,
  ) {}

  updateEntity(
    entity: Entity,
    player: Player,
    position: Position,
    extents: Extents,
    physicsCollision: PhysicsCollision,
    physicsBody: PhysicsBody,
    graphicsAnimation: GraphicsAnimation,
  ) {
    let left =
      this.input.Pressed(Key.LeftArrow) || this.input.Pressed(Key.Comma)
    let right =
      this.input.Pressed(Key.RightArrow) || this.input.Pressed(Key.ForwardSlash)
    const down =
      this.input.Pressed(Key.DownArrow) || this.input.Pressed(Key.Period)

    const jumpStart = this.input.JustPressed(Key.G)
    const jumpHold = this.input.Pressed(Key.G)
    const shootNow = this.input.JustPressed(Key.R)
    const shootHold = this.input.Pressed(Key.R)

    // Holding both horizontal directions at once cancels them.
    if (left && right) {
      left = false
      right = false
    }

    // When walking on the ground, disable the effects of friction on movement.
    // We do this because the physics system models the friction as impeding
    // movement, with the character modeled as a sliding box.
    // In the real world, walking movement is aided by friction, with high
    // friction helping the shoes to get traction and move at full speed.
    // So in order to model that here, we use a zero friction when walking.
    // But as soon as the character stops walking, friction is restored.
    // TODO: Add the possibility of slippery ice-like friction.
    if (physicsBody.body.onGround && (left || right))
      physicsBody.body.material.friction = 0
    else physicsBody.body.material.friction = 0.2

    // A jump can be initiated when starting from the ground.
    if (physicsBody.body.onGround && jumpStart) {
      // Holding down and pressing jump will start a slide instead of a jump.
      if (down) {
        // A slide can't be initiated while already sliding -
        // doing so would allow infinite sliding without standing up.
        if (!player.isSliding) {
          player.startSliding(this.timestamp)
          physicsBody.body.addProportionalForce(new Vector2(0, 100))
        }
      } else {
        // A jump can't be initiated when sliding under a low ceiling.
        const slidingUnderALowCeiling =
          player.isSliding && this.isPlayerUnderALowCeiling(position.coords)
        if (!slidingUnderALowCeiling) {
          physicsBody.body.addProportionalForce(new Vector2(0, -100))
          player.stopSliding() // jumping can cancel a slide
        }
      }
    }

    // If already sliding for a while, the slide should stop,
    // unless the player's head is directly under a tile
    if (
      player.startedSlidingAt &&
      player.startedSlidingAt <= this.timestamp - 500 &&
      !this.isPlayerUnderALowCeiling(position.coords)
    ) {
      player.stopSliding()
    }

    // Leaving the ground while sliding, if the slide has been going on for
    // some time (such as sliding off a ledge) cancels the slide.
    if (
      player.isSliding &&
      !physicsBody.body.onGround &&
      player.startedSlidingAt &&
      player.startedSlidingAt <= this.timestamp - 100
    ) {
      player.stopSliding()
      physicsBody.body.velocity.x = 0
    }

    // If shoot button was just pressed, start the shoot timer.
    if (shootNow) {
      player.shootNow(this.timestamp)
    }

    // Not holding the jump button cancels any upward movement.
    // This allows the player to control the total jump height.
    if (!jumpHold && physicsBody.body.velocity.y < 0)
      physicsBody.body.velocity.y = 0

    // Holding the left or right arrow key applies a force in that direction,
    // whether walking on the ground or jumping/falling through the air
    // (platformer games often ignore realistic jumping physics that would
    // imply having very little ability to influence one's velocity mid-air,
    // because it feels satisfying to have a high degree of mid-air control)
    //
    // The force amount is low when the current velocity is low, but much
    // higher when the current velocity is already high.
    //
    // In practice, this allows for taking small, inching steps (low force)
    // but also for quickly turning around when already in horizontal motion.
    //
    // We use a proportional force so that the character mass is ignored,
    // allowing the acceleration to be predictable for different characters,
    // making the in-universe justifying assumption that a character's size
    // is roughly proportional to their muscle system's motive force
    if (left || right) {
      const xForceAmount = Math.abs(physicsBody.body.velocity.x) < 70 ? 0.1 : 10
      physicsBody.body.addProportionalForce(
        new Vector2(left ? xForceAmount * -1 : xForceAmount, 0),
      )
    }
    // If not pressing left or right, sliding impels a force of its own,
    // which is in the current facing direction and of a constant magnitude.
    // Pressing left or right while sliding can change direction of the slide,
    // but that uses the code path above rather than this one
    // (which is why this is an `else if`)
    else if (player.isSliding) {
      const xForceAmountSlide = 100
      physicsBody.body.addProportionalForce(
        new Vector2(
          position.direction.x < 0 ? xForceAmountSlide * -1 : xForceAmountSlide,
          0,
        ),
      )
    }

    // If the player is currently sliding, the bounding box becomes
    // short and wide, as opposed to its default state of tall and narrow.
    if (player.isSliding) {
      extents.halfWidths.x = 11 // 20
      extents.halfWidths.y = 15.5
      physicsCollision.proxy.aabb.extents.copy(extents.halfWidths)
      physicsBody.body.maxVelocity.setTo(308, 630)
    } else {
      extents.halfWidths.x = 11
      extents.halfWidths.y = 22
      extents.offset.y = 0
      physicsCollision.proxy.aabb.extents.copy(extents.halfWidths)
      physicsBody.body.maxVelocity.setTo(160, 630)
    }

    // Update the shown animation based on current state.
    if (player.isSliding) {
      graphicsAnimation.play("slide")
    } else if (
      physicsBody.body.onGround &&
      Math.abs(physicsBody.body.velocity.x) > 50
    ) {
      // If already walking, set the animation ID instead of calling `play`,
      // so that changing to walk-shoot won't start at the first frame of the
      // animation, but will rather switch seamlessly to the same frame in
      // the other animation as it was about to use in the current animation.
      //
      // This prevents an issue where tapping shoot quickly while walking
      // would keep the character stuck at the first frame of the animation,
      // making it look like they were skating while shooting, instead of
      // walking while shooting as they are supposed to be.
      const alreadyWalking = graphicsAnimation.animationId.startsWith("walk")
      const newWalk =
        player.isShootingNow(this.timestamp) || shootHold
          ? "walk-shoot"
          : "walk"
      graphicsAnimation.play(newWalk, {
        shouldNotResetTime: alreadyWalking,
      })
    } else if (
      physicsBody.body.onGround &&
      Math.abs(physicsBody.body.velocity.x) > 1 &&
      Math.abs(physicsBody.body.velocity.x) >
        Math.abs(physicsBody.body.previousVelocity.x)
    ) {
      if (player.isShootingNow(this.timestamp) || shootHold) {
        graphicsAnimation.play("shoot")
      } else {
        graphicsAnimation.play("step")
      }
    } else if (!physicsBody.body.onGround) {
      if (player.isShootingNow(this.timestamp) || shootHold) {
        graphicsAnimation.play("jump-shoot")
      } else {
        graphicsAnimation.play("jump")
      }
    } else {
      if (player.isShootingNow(this.timestamp) || shootHold) {
        graphicsAnimation.play("shoot")
      } else {
        graphicsAnimation.play("idle")
      }
    }
  }

  private isPlayerUnderALowCeilingAABB2 = new AABB2()
  isPlayerUnderALowCeiling(position: Vector2) {
    const checkBounds = this.isPlayerUnderALowCeilingAABB2
    checkBounds.l = position.x - GZE.tileSize * 0.45
    checkBounds.r = position.x + GZE.tileSize * 0.45
    checkBounds.t = position.y - GZE.tileSize * 1.45
    checkBounds.b = position.y - GZE.tileSize * 0.55

    let isUnderALowCeiling = false
    this.tileMap.iterateCells(checkBounds, () => {
      isUnderALowCeiling = true
    })
    return isUnderALowCeiling
  }
}
