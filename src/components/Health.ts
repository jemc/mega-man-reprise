import { Engine } from "glazejs/src/glaze/ecs/Engine"
import { Entity } from "glazejs/src/glaze/ecs/Entity"
import { Position } from "glazejs/src/glaze/core/components/Position"

interface HealthConfig {
  max: number
  receiveDamageDurationMillis: number
  deathAction: (engine: Engine, entity: Entity, position: Position) => void
}

export default class Health {
  config: HealthConfig
  current: number
  receivingDamageUntil = 0
  immuneToDamageUntil = 0
  pendingDamage = 0
  currentlyDeflectsBullets = false

  constructor(config: HealthConfig) {
    this.config = config
    this.current = config.max
  }

  get isDead() {
    return this.current <= 0
  }

  sendDamage(amount: number) {
    if (!this.pendingDamage) this.pendingDamage = amount
  }

  sendBulletDamage(amount: number): boolean {
    if (this.currentlyDeflectsBullets) return false
    this.sendDamage(amount)
    return true
  }

  get isReceivingDamage() {
    return !!this.receivingDamageUntil
  }

  get isImmuneToDamage() {
    return !!this.immuneToDamageUntil
  }

  update(timestamp: number) {
    if (this.receivingDamageUntil < timestamp) this.receivingDamageUntil = 0
    if (this.immuneToDamageUntil < timestamp) this.immuneToDamageUntil = 0
    if (this.pendingDamage) {
      if (this.receivingDamageUntil || this.immuneToDamageUntil) {
        this.pendingDamage = 0
      } else {
        this.current -= this.pendingDamage
        this.receivingDamageUntil =
          timestamp + this.config.receiveDamageDurationMillis
      }
    }
  }
}
