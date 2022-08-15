import Aseprite from "ase-parser"
import { TileMapCollision } from "glaze/physics/collision/broadphase/TileMapCollision"
import { Bytes2D } from "glaze/ds/Bytes2D"
import { GZE } from "glaze/GZE"

const NOTHING_ID = 0
const LADDER_ID = 140 // TODO: not hard-coded

const COLLIDE_NONE = 0
const COLLIDE_SOLID = 1
const COLLIDE_ONE_WAY = 1 << 1

export default function loadIntoTileMapCollision(aseMapData: Aseprite) {
  // TODO: Don't hard-code the 1 index
  const aseMapCel = aseMapData.frames[0].cels[1]
  const tileMapData = new Uint32Array(aseMapCel.rawCelData.buffer)

  const collisionData = new Bytes2D(
    aseMapCel.w,
    aseMapCel.h,
    GZE.tileSize * 2,
    1,
  )
  tileMapData.forEach((tileDatum, index) => {
    collisionData.data8[index] = getCollisionType(
      aseMapCel,
      tileMapData,
      tileDatum,
      index,
    )
  })

  return new TileMapCollision(collisionData)
}

function getCollisionType(
  aseMapCel: Aseprite.Cel,
  tileMapData: Uint32Array,
  tileDatum: number,
  index: number,
): number {
  // A nothing tile always has no collision.
  if (tileDatum === NOTHING_ID) return COLLIDE_NONE

  // If the tile map shows a ladder tile,
  // and the tile above it is a nothing tile, treat it as a "one-way" tile.
  if (
    tileDatum === LADDER_ID &&
    index > aseMapCel.w &&
    tileMapData[index - aseMapCel.w] === NOTHING_ID
  )
    return COLLIDE_ONE_WAY

  // All other ladder tiles have no collision.
  if (tileDatum === LADDER_ID) return COLLIDE_NONE

  // All other tiles are solid.
  return COLLIDE_SOLID
}
