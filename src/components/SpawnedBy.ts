import SpawnOnCameraArrival from "./SpawnOnCameraArrival"

export default class SpawnedBy {
  spawner: SpawnOnCameraArrival

  constructor(spawner: SpawnOnCameraArrival) {
    this.spawner = spawner
  }
}
