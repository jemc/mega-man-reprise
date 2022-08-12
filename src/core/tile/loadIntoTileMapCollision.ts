import { TileMapCollision } from "glaze/physics/collision/broadphase/TileMapCollision"
import { Bytes2D } from "glaze/ds/Bytes2D"
import { GZE } from "glaze/GZE"

export default function loadIntoTileMapCollision(
  aseMapData: AsepriteLoader.Data,
) {
  // TODO: Don't hard-code the 1 index
  const aseMapCel = aseMapData.frames[0].cels[1]
  const collisionData = new Bytes2D(
    aseMapCel.w,
    aseMapCel.h,
    GZE.tileSize * 2,
    1,
  )
  new Uint32Array(aseMapCel.rawCelData.buffer).forEach((tileDatum, index) => {
    collisionData.data8[index] = tileDatum !== 0 ? 1 : 0
  })

  return new TileMapCollision(collisionData)
}
