import Aseprite from "ase-parser"
import { TileMapCollision } from "glaze/physics/collision/broadphase/TileMapCollision"
import { Bytes2D } from "glaze/ds/Bytes2D"
import { GZE } from "glaze/GZE"
import { Position } from "glazejs/src/glaze/core/components/Position"
import { Extents } from "glazejs/src/glaze/core/components/Extents"

// These collision kinds map to the ones defined in the TileMapCollision class.
const COLLIDE_NONE = 0
const COLLIDE_SOLID = 1
const COLLIDE_ONE_WAY = 1 << 1

function loadIntoTileMapCollision(ase: Aseprite) {
  const loader = new TileMapCollisionLoader(ase, "Foreground")

  return new TileMapCollision(loader.getCollisionData())
}

export default class TileMapCollisionLoader {
  ase: Aseprite
  layer: Aseprite.Layer
  cel: Aseprite.Cel
  tilemapData: Uint32Array
  tilemapMetadata: NonNullable<Aseprite.Cel["tilemapMetadata"]>
  specialTiles: {
    empty: number[]
    ladder: number[]
  }

  noticedLadders: [Position, Extents][] = []

  constructor(ase: Aseprite, layerName: string) {
    this.ase = ase

    // Get the layer with the given name.
    const layerIndex = this.ase.layers.findIndex(
      (layer) => layer.name === layerName,
    )
    const layer = this.ase.layers[layerIndex]
    if (!layer) throw new Error(`Aseprite data has no ${layerName} layer`)
    this.layer = layer

    // Get the cel for that layer in frame zero.
    const cel = this.ase.frames[0]?.cels.find(
      (cel) => cel.layerIndex === layerIndex,
    )
    if (!cel)
      throw new Error(`Aseprite ${layerName} layer has no cel in frame zero`)
    this.cel = cel

    // Get the tilemap metadata for that cel.
    const { tilemapMetadata } = this.cel
    if (!tilemapMetadata)
      throw new Error(`Aseprite ${layerName} layer is not a tilemap`)
    this.tilemapMetadata = tilemapMetadata

    // Get the tilemap data for that cel.
    if (tilemapMetadata.bitsPerTile !== 32)
      throw new Error(`Aseprite tilemap ${layerName} is not 32-bit`)
    this.tilemapData = new Uint32Array(this.cel.rawCelData.buffer)

    // Get the tile ids that have special collision treatment.
    const celParams = new URLSearchParams(this.cel.userDataText)
    const empty = [
      0,
      ...celParams.getAll("empty").map((value) => Number.parseInt(value)),
    ]
    const ladder = celParams
      .getAll("ladder")
      .map((value) => Number.parseInt(value))
    this.specialTiles = { empty, ladder }
  }

  coordsFor(index: number): [number, number] {
    return [index % this.cel.w, Math.floor(index / this.cel.w)]
  }

  tileAbove(index: number, distance: number = 1): number {
    const tileBits = this.tilemapData[index - this.cel.w * distance]
    return tileBits === undefined
      ? -1
      : tileBits & this.tilemapMetadata.bitmaskForTileId
  }

  tileBelow(index: number, distance: number = 1): number {
    const tileBits = this.tilemapData[index + this.cel.w * distance]
    return tileBits === undefined
      ? -1
      : tileBits & this.tilemapMetadata.bitmaskForTileId
  }

  isTile(kind: keyof TileMapCollisionLoader["specialTiles"], tile: number) {
    return this.specialTiles[kind].includes(tile)
  }

  getCollisionData() {
    const collisionData = new Bytes2D(
      this.cel.w,
      this.cel.h,
      GZE.tileSize * 2,
      1,
    )
    this.tilemapData.forEach((tileBits, index) => {
      collisionData.data8[index] = this.getCollisionType(tileBits, index)
    })
    return collisionData
  }

  getCollisionType(tileBits: number, index: number) {
    const tile = tileBits & this.tilemapMetadata.bitmaskForTileId

    // An empty tile always has no collision.
    if (this.isTile("empty", tile)) return COLLIDE_NONE

    // If the tile map shows a ladder tile and the tile above it is empty,
    // treat it as a "one-way" tile. You can stand on top of a ladder.
    if (this.isTile("ladder", tile)) {
      const tileAbove = this.tileAbove(index)

      // If the tile above is not a ladder, this is the top of the ladder,
      // so we want to take a moment to find the bottom and take note, so we
      // can later create a Climbable entity corresponding to the entire ladder.
      if (!this.isTile("ladder", tileAbove)) {
        let ladderHeight = 1
        while (this.isTile("ladder", this.tileBelow(index, ladderHeight))) {
          ladderHeight++
        }
        const [ladderTopX, ladderTopY] = this.coordsFor(index)
        this.noticedLadders.push([
          new Position(
            ladderTopX * GZE.tileSize * 2 + GZE.tileSize,
            (ladderTopY + ladderHeight / 2) * GZE.tileSize * 2,
          ),
          new Extents(GZE.tileSize, ladderHeight * GZE.tileSize),
        ])
      }

      // If the tile above is empty, treat this as a "one-way" tile, allowing
      // entities to stand "on top" of the ladder, but not collide into it.
      if (this.isTile("empty", tileAbove)) return COLLIDE_ONE_WAY

      // All other ladder tiles are treated as if empty.
      return COLLIDE_NONE
    }

    // All other tiles are solid.
    return COLLIDE_SOLID
  }
}
