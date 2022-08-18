import { Entity } from "glaze/ecs/Entity"
import { System } from "glaze/ecs/System"

import SegmentedDisplay from "../components/SegmentedDisplay"
import GraphicsAnimation from "../components/GraphicsAnimation"

export default class SegmentedDisplaySystem extends System {
  constructor() {
    super([SegmentedDisplay])
  }

  updateEntity(entity: Entity, segmentedDisplay: SegmentedDisplay) {
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
