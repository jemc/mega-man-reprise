import { Engine } from "glaze/ecs/Engine"
import { Entity } from "glazejs/src/glaze/ecs/Entity"
import { Position } from "glaze/core/components/Position"
import { Active } from "glaze/core/components/Active"
import { Graphics } from "glazejs/src/glaze/graphics/components/Graphics"

import GraphicsAnimation from "../../components/GraphicsAnimation"
import States from "../../components/States"

export default function createExplodeSimple(
  engine: Engine,
  entity: Entity,
  position: Position,
) {
  engine.addComponentsToEntity(engine.createEntity(), [
    position.clone(),
    new Graphics("explode"),
    new GraphicsAnimation("explode", "main"),
    new Active(),
    new States("main", {
      main: { maxDuration: 400, then: "destroy" },
    }),
  ])
}
