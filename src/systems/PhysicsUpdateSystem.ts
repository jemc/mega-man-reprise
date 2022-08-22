// The following code is copied from https://github.com/rjewson/glazejs
// and is available under the original ISC license.
// Copyrights are owned by the original author.

import { System } from "glaze/ecs/System"
import { Vector2 } from "glaze/geom/Vector2"
import { Position } from "glaze/core/components/Position"
import { PhysicsBody } from "glaze/physics/components/PhysicsBody"
import { Active } from "glaze/core/components/Active"
import { Entity } from "glaze/ecs/Entity"

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
    // Unlike the upstream glaze library, we avoid updating direction
    // based on velocity here, because things aren't always facing in the same
    // direction that they are moving. For example, a character receiving
    // damage may get knocked backwards, but this doesn't necessarily change
    // which direction their front face is pointing.
  }
}
