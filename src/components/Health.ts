interface HealthConfig {
  max: number
  receiveDamageDurationMillis: number
}

export default class Health {
  config: HealthConfig
  current: number
  receivingDamageUntil = 0
  immuneToDamageUntil = 0
  pendingDamage = 0

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
