import { Engine } from "glaze/ecs/Engine"
import { Entity } from "glaze/ecs/Entity"
import { Position } from "glaze/core/components/Position"
import { Graphics } from "glazejs/src/glaze/graphics/components/Graphics"
import { Active } from "glaze/core/components/Active"

import HUDPositioning from "../components/HUDPositioning"
import GraphicsAnimation from "../components/GraphicsAnimation"
import SegmentedDisplay from "../components/SegmentedDisplay"
import Health from "../components/Health"

// Verified to match screenshots of the official games.
const baseX = 24
const baseY = 44

export default class HealthDisplayFactory {
  static create(engine: Engine, player: Entity): Entity {
    // Create the separate segments which together display the value.
    const segments: Entity[] = []
    for (let i = 0; i < 7; i++) {
      const segment = engine.createEntity()
      engine.addComponentsToEntity(segment, [
        new Position(baseX, baseY + 16 * i),
        new HUDPositioning(),
        new Graphics("etude-health"),
        new GraphicsAnimation("etude-health", "4"),
        new Active(),
      ])
      segments.push(segment)
    }

    // Create the entity that updates the segments according to the value.
    const entity = engine.createEntity()
    engine.addComponentsToEntity(entity, [
      new SegmentedDisplay(100, {
        segments,
        segmentSize: 4,
        getValueFrom: () => {
          const health = engine.getComponentForEntity(player, Health)
          if (!health) return 0
          return health.current / health.config.max
        },
      }),
      new Active(),
    ])

    return entity
  }
}
