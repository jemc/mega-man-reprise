// The following code is copied from https://github.com/rjewson/glazejs
// and is available under the original ISC license.
// Copyrights are owned by the original author.
//
// TODO: Remove this file when the bug fix PR is merged:
// https://github.com/rjewson/glazejs/pull/23

import { System } from "glazejs/src/glaze/ecs/System"
import { Vector2 } from "glazejs/src/glaze/geom/Vector2"
import { Position } from "glazejs/src/glaze/core/components/Position"
import { PhysicsBody } from "glazejs/src/glaze/physics/components/PhysicsBody"
import { Active } from "glazejs/src/glaze/core/components/Active"
import { Entity } from "glazejs/src/glaze/ecs/Entity"

export default class PhysicsUpdateSystem extends System {
  public globalForce: Vector2
  public globalDamping: number

  constructor() {
    super([Position, PhysicsBody, Active])
    this.globalForce = new Vector2(0, 30)
    this.globalDamping = 0.99
  }

  onEntityAdded(
    entity: Entity,
    position: Position,
    physicsBody: PhysicsBody,
    active: Active,
  ) {
    physicsBody.body.position.copy(position.coords)
  }

  updateEntity(
    entity: Entity,
    position: Position,
    physicsBody: PhysicsBody,
    active: Active,
  ) {
    physicsBody.body.update(
      this.dt / 1000,
      this.globalForce,
      this.globalDamping,
    )
    // If the body is moving in the X direction, update the direction vector
    // to match the direction of the velocity.
    // Note that if the X velocity is zero, the direction will remain unchanged.
    if (physicsBody.body.velocity.x > 0) {
      position.direction.x = 1
    } else if (physicsBody.body.velocity.x < 0) {
      position.direction.x = -1
    }
  }
}
