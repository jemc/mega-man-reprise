import { Entity } from "glaze/ecs/Entity"
import { System } from "glaze/ecs/System"
import { Active } from "glazejs/src/glaze/core/components/Active"
import { ContactCallback } from "glazejs/src/glaze/physics/collision/contact/Contact"
import { PhysicsCollision } from "glazejs/src/glaze/physics/components/PhysicsCollision"

import DamagesEnemyOnContact from "../components/DamagesEnemyOnContact"
import Health from "../components/Health"
import Enemy from "../components/Enemy"

export default class DamagesEnemyOnContactSystem extends System {
  callbacks = new Map<Entity, ContactCallback>()

  constructor() {
    super([DamagesEnemyOnContact, PhysicsCollision, Active])
  }

  // When added to the system, add the callback.
  onEntityAdded(
    entity: number,
    damage: DamagesEnemyOnContact,
    physicsCollision: PhysicsCollision,
    active: Active,
  ) {
    const callback: ContactCallback = (damager, other, contact) => {
      const enemy = this.engine.getComponentForEntity(other?.entity, Enemy)
      if (!enemy) return

      const health = this.engine.getComponentForEntity(other?.entity, Health)
      if (!health) return

      health.sendDamage(damage.amount)
    }

    this.callbacks.set(entity, callback)

    physicsCollision.proxy.contactCallbacks.push(callback)
  }

  // When removed from the system, remove the callback.
  onEntityRemoved(
    entity: number,
    damage: DamagesEnemyOnContact,
    physicsCollision: PhysicsCollision,
    active: Active,
  ): void {
    const callback = this.callbacks.get(entity)
    if (!callback) return

    const { contactCallbacks } = physicsCollision.proxy

    const callbackIndex = contactCallbacks.indexOf(callback)
    if (callbackIndex < 0) return

    contactCallbacks.splice(callbackIndex, 1)
  }
}
