import { Vector2 } from "glazejs/src/glaze/geom/Vector2"

interface ExtentsFollowSpriteExtentsConfig {
  marginX?: number
  marginY?: number
}

export default class ExtentsFollowSpriteExtents {
  config: ExtentsFollowSpriteExtentsConfig
  lastOffset?: Vector2
  constructor(config: ExtentsFollowSpriteExtentsConfig) {
    this.config = config
  }
}
