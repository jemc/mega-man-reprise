import { Entity } from "glaze/ecs/Entity"
import { System } from "glaze/ecs/System"
import { Position } from "glaze/core/components/Position"
import { Camera } from "glazejs/src/glaze/graphics/displaylist/Camera"

import SpawnOnCameraArrival from "../components/SpawnOnCameraArrival"
import SpawnedBy from "../components/SpawnedBy"

export default class SpawnOnCameraArrivalSystem extends System {
  private camera: Camera

  constructor(camera: Camera) {
    super([SpawnOnCameraArrival, Position])
    this.camera = camera
  }

  updateEntity(
    entity: Entity,
    spawn: SpawnOnCameraArrival,
    position: Position,
  ) {
    const { marginX, marginY, spawnAction } = spawn.config
    const xFromCenter = Math.abs(
      position.coords.x +
        this.camera.position.x -
        this.camera.halfViewportSize.x,
    )
    const yFromCenter = Math.abs(
      position.coords.y +
        this.camera.position.y -
        this.camera.halfViewportSize.y,
    )

    if (
      xFromCenter < this.camera.halfViewportSize.x + (marginX ?? 32) &&
      yFromCenter < this.camera.halfViewportSize.y + (marginY ?? 32)
    ) {
      // If the spawn point is inside the viewport or near enough to it,
      // and the spawn point is ready to spawn, then spawn now.
      if (spawn.readyToSpawn) {
        spawn.spawned = spawnAction(this.engine, entity, position)
        spawn.readyToSpawn = false
        // Add a SpawnedBy component to link the spawned entity back to
        // the spawn point entity, so that it can notify our spawn component
        // when the entity has been destroyed.
        this.engine.addComponentsToEntity(spawn.spawned, [new SpawnedBy(spawn)])
      }
    } else {
      // If the spawn point is not near the viewport, and no spawned entity
      // currently exists, go into a "ready to spawn" state, which means that
      // when the viewpoint comes back to near the spawn point again,
      // we'll be ready to spawn the entity again.
      if (!spawn.readyToSpawn && !spawn.spawned) {
        spawn.readyToSpawn = true
      }
    }
  }
}
