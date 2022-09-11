import { Entity } from "glaze/ecs/Entity"
import { System } from "glaze/ecs/System"
import { Position } from "glaze/core/components/Position"
import { Active } from "glazejs/src/glaze/core/components/Active"
import { PhysicsBody } from "glazejs/src/glaze/physics/components/PhysicsBody"
import { Vector2 } from "glazejs/src/glaze/geom/Vector2"

import FollowsPlayer from "../components/FollowsPlayer"
import PlayerAware from "../components/PlayerAware"
import Climber from "../components/Climber"

export default class FollowsPlayerSystem extends System {
  constructor() {
    super([FollowsPlayer, PlayerAware, Position, PhysicsBody, Active])
  }

  updateEntity(
    entity: Entity,
    followsPlayer: FollowsPlayer,
    playerAware: PlayerAware,
    position: Position,
    physicsBody: PhysicsBody,
    active: Active,
  ) {
    const {
      lookX,
      lookHysteresis,
      walkX,
      walkHysteresis,
      climbY,
      climbHysteresis,
    } = followsPlayer.config
    const { playerOffset } = playerAware

    if (lookX) {
      if (playerOffset.x > (lookHysteresis ?? 0)) {
        position.direction.x = 1
      } else if (playerOffset.x < -(lookHysteresis ?? 0)) {
        position.direction.x = -1
      }
    }
    if (walkX) {
      if (Math.abs(playerOffset.x) > (walkHysteresis ?? 0)) {
        physicsBody.body.addProportionalForce(
          new Vector2(playerOffset.x > 0 ? 100 : -100, 0),
        )
      }
    }
    if (climbY) {
      let wantsUp = false
      let wantsDown = false
      if (playerOffset.y > (climbHysteresis ?? 0)) {
        wantsDown = true
      } else if (playerOffset.y < -(climbHysteresis ?? 0)) {
        wantsUp = true
      }

      if (wantsUp || wantsDown) {
        const climber = this.engine.getComponentForEntity(entity, Climber)
        if (climber) {
          climber.wantsUp = wantsUp
          climber.wantsDown = wantsDown
        }
      }
    }
  }
}
