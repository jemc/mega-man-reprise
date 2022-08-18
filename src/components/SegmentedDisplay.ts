import { Entity } from "glazejs/src/glaze/ecs/Entity"

interface SegmentedDisplayConfig {
  segments: Entity[]
  segmentSize: number
  getValueFrom: () => number
}

export default class SegmentedDisplay {
  private _currentValue: number
  config: SegmentedDisplayConfig

  constructor(initialValue: number, config: SegmentedDisplayConfig) {
    this._currentValue = initialValue
    this.config = config
  }

  get currentValue() {
    return this._currentValue
  }

  setNewValueIntoSegments(
    nextValue: number,
    callback: (segment: Entity, segmentValue: number) => void,
  ) {
    if (this._currentValue === nextValue) return
    const { segments, segmentSize } = this.config

    const resolution = segments.length * segmentSize
    const prev = Math.ceil(this._currentValue * resolution)
    const next = Math.ceil(nextValue * resolution)

    segments.forEach((segment, index) => {
      const offset = (segments.length - 1 - index) * segmentSize
      const prevSegmentValue = Math.min(Math.max(prev - offset, 0), segmentSize)
      const nextSegmentValue = Math.min(Math.max(next - offset, 0), segmentSize)
      if (prevSegmentValue !== nextSegmentValue)
        callback(segment, nextSegmentValue)
    })

    this._currentValue = nextValue
  }
}
