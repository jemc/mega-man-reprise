export type DamagesEnemyOnContactKind = "bullet" // TODO: other options

export default class DamagesEnemyOnContact {
  kind: DamagesEnemyOnContactKind
  amount: number
  constructor(kind: DamagesEnemyOnContactKind, amount: number) {
    this.kind = kind
    this.amount = amount
  }
}
