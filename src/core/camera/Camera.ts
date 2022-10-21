import { DisplayObjectContainer } from "glaze/graphics/displaylist/DisplayObjectContainer"
import { Vector2 } from "glaze/geom/Vector2"
import { AABB2 } from "glaze/geom/AABB2"

const CAMERA_TRACKING_SPEED = 0.1
export class Camera extends DisplayObjectContainer {
  realPosition = new Vector2()
  viewportSize = new Vector2()
  halfViewportSize = new Vector2()
  quarterViewportSize = new Vector2()
  worldExtentsAABB = new AABB2()
  rooms: [string, AABB2][] = []

  constructor() {
    super()
    this.id = "Camera"
  }

  determineCurrentRoom(x: number, y: number) {
    return this.rooms.find(
      ([name, aabb]) => x >= aabb.l && x < aabb.r && y >= aabb.t && y < aabb.b,
    )
  }

  public Focus(doubleX: number, doubleY: number) {
    var x = doubleX / 2
    var y = doubleY / 2

    const roomInfo = this.determineCurrentRoom(x, y)
    if (!roomInfo) return
    const [roomName, roomAABB] = roomInfo

    const minX = roomAABB.l + this.quarterViewportSize.x
    const maxX = roomAABB.r - this.quarterViewportSize.x
    const minY = roomAABB.t + this.quarterViewportSize.y
    const maxY = roomAABB.b - this.quarterViewportSize.y

    if (x < minX) x = minX
    if (x > maxX) x = maxX
    if (y < minY) y = minY
    if (y > maxY) y = maxY

    this.realPosition.x = x * 2
    this.realPosition.y = y * 2

    var positionx = -this.realPosition.x + this.halfViewportSize.x
    var positiony = -this.realPosition.y + this.halfViewportSize.y

    if (Math.abs(positionx - this.position.x) > 2)
      this.position.x =
        this.position.x + (positionx - this.position.x) * CAMERA_TRACKING_SPEED
    if (Math.abs(positiony - this.position.y) > 2)
      this.position.y =
        this.position.y + (positiony - this.position.y) * CAMERA_TRACKING_SPEED
  }

  Resize(width: number, height: number) {
    this.viewportSize.x = width
    this.viewportSize.y = height
    this.halfViewportSize.x = width / 2
    this.halfViewportSize.y = height / 2
    this.quarterViewportSize.x = width / 4
    this.quarterViewportSize.y = height / 4
  }
}
