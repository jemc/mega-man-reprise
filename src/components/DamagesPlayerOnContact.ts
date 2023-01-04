interface DamagesPlayerOnContactConfig {
  amount: number
  absorb?: boolean
}

export default class DamagesPlayerOnContact {
  config: DamagesPlayerOnContactConfig
  constructor(config: DamagesPlayerOnContactConfig) {
    this.config = config
  }
}
