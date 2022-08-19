import { Entity } from "glaze/ecs/Entity"
import { System } from "glaze/ecs/System"
import { Active } from "glazejs/src/glaze/core/components/Active"

import SegmentedDisplay from "../components/SegmentedDisplay"
import GraphicsAnimation from "../components/GraphicsAnimation"

export default class SegmentedDisplaySystem extends System {
  constructor() {
    super([SegmentedDisplay, Active])
  }

  updateEntity(
    entity: Entity,
    segmentedDisplay: SegmentedDisplay,
    active: Active,
  ) {
    const newValue = segmentedDisplay.config.getValueFrom()

    segmentedDisplay.setNewValueIntoSegments(
      newValue,
      (segment, segmentValue) => {
        const animation: GraphicsAnimation | undefined =
          this.engine.getComponentForEntity(segment, GraphicsAnimation)
        animation?.play(segmentValue.toString())
      },
    )
  }
}
