import { Entity } from "glaze/ecs/Entity"
import { System } from "glaze/ecs/System"
import { Active } from "glazejs/src/glaze/core/components/Active"
import { ContactCallback } from "glazejs/src/glaze/physics/collision/contact/Contact"
import { PhysicsCollision } from "glazejs/src/glaze/physics/components/PhysicsCollision"

import DamagesEnemyOnContact from "../components/DamagesEnemyOnContact"
import Health from "../components/Health"
import Enemy from "../components/Enemy"
import { PhysicsBody } from "glazejs/src/glaze/physics/components/PhysicsBody"
import { Vector2 } from "glazejs/src/glaze/geom/Vector2"

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

      if (damage.kind === "bullet") {
        this.sendBulletDamage(entity, damage, health)
      } else {
        health.sendDamage(damage.amount)
      }
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

  // Handle the particulars of sending damage of the bullet kind.
  private sendBulletDamage(
    entity: number,
    damage: DamagesEnemyOnContact,
    health: Health,
  ) {
    // Try to send bullet damage. Will return false if the bullet is deflected.
    const didDamage = health.sendBulletDamage(damage.amount)

    console.log("didDamage", didDamage, entity)

    if (didDamage) {
      // If the bullet did damage, the bullet is destroyed.
      this.engine.destroyEntity(entity)
    } else {
      // Otherwise, try to get its physics body.
      const physicsBody: PhysicsBody | undefined =
        this.engine.getComponentForEntity(entity, PhysicsBody)
      if (physicsBody) {
        // If we got a physics body, the bullet is deflected by applying an
        // infinite force in the upper-diagonal direction. The force is infinite
        // but we expect the max velocity of the bullet to limit its speed.
        physicsBody.body.addProportionalForce(
          new Vector2(-Infinity * physicsBody.body.velocity.x, -Infinity),
        )

        // We also remove the ability for the deflected bullet to be able to do
        // further damage to other enemies it might hit on its deflected path.
        this.engine.removeComponentsFromEntityByType(entity, [
          DamagesEnemyOnContact,
        ])
      } else {
        // If we can't do a physics body deflection, just detroy the bullet.
        this.engine.destroyEntity(entity)
      }
    }
  }
}
