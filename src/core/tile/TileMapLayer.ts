import Aseprite from "ase-parser"
import { Bytes2D } from "glaze/ds/Bytes2D"
import { GZE } from "glaze/GZE"
import { Position } from "glazejs/src/glaze/core/components/Position"
import { Extents } from "glazejs/src/glaze/core/components/Extents"

// These collision kinds map to the ones defined in the TileMapCollision class.
const COLLIDE_NONE = 0
const COLLIDE_SOLID = 1
const COLLIDE_ONE_WAY = 1 << 1

export default class TileMapLayer {
  ase: Aseprite
  layer: Aseprite.Layer
  cel: Aseprite.Cel
  tilesetIndex: number
  tilemapData: Uint32Array
  tilemapMetadata: NonNullable<Aseprite.Cel["tilemapMetadata"]>
  specialTiles: {
    empty: number[]
    start: number[]
    ladder: number[]
    spike: number[]
    spawn: Map<number, string>
  }

  noticedStartPoint?: Position
  noticedLadders: [Position, Extents][] = []
  noticedSpikes: Position[] = []
  noticedSpawns: [string, Position][] = []

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

    // Get the tileset index for that layer.
    const { tilesetIndex } = this.layer
    if (tilesetIndex === undefined)
      throw new Error(`Aseprite ${layerName} layer is not a tilemap`)
    this.tilesetIndex = tilesetIndex

    // Get the tilemap metadata for that cel.
    const { tilemapMetadata } = this.cel
    if (!tilemapMetadata)
      throw new Error(`Aseprite ${layerName} layer has no tilemap metadata`)
    this.tilemapMetadata = tilemapMetadata

    // Get the tilemap data for that cel.
    if (tilemapMetadata.bitsPerTile !== 32)
      throw new Error(`Aseprite tilemap ${layerName} is not 32-bit`)
    this.tilemapData = new Uint32Array(this.cel.rawCelData.buffer)

    // Get the tile ids that have special collision treatment.
    const celParams = new URLSearchParams(this.cel.userDataText)

    // Zero is always an empty tile, but others may be declared as empty.
    //
    // example: empty=36&empty=42
    // yields: empty: [0, 36, 42]
    const empty = [
      0,
      ...celParams.getAll("empty").map((value) => Number.parseInt(value)),
    ]

    // Some tiles may be declared as start points, which indicate where the
    // player will arrive when first starting the level. We'll only track the
    // first one of these that we encounter in the level, and ignore the rest,
    // but multiple tile types may be defined as start points (though that
    // doesn't make much sense) and they'll each have equal treatment.
    //
    // example: start=36&start=42
    // yields:  start: [36, 42]
    const start = celParams
      .getAll("start")
      .map((value) => Number.parseInt(value))

    // Some tiles may be declared as ladders, which will be climbable,
    // and it will be possible to stand on the top of each ladder.
    //
    // example: ladder=36&ladder=42
    // yields:  ladder: [36, 42]
    const ladder = celParams
      .getAll("ladder")
      .map((value) => Number.parseInt(value))

    // Some tiles may be declared as spikes, which will trigger instant death.
    //
    // example: spike=36&spike=42
    // yields:  spike: [36, 42]
    const spike = celParams
      .getAll("spike")
      .map((value) => Number.parseInt(value))

    // Some tiles may be declared as spawns, which will create an entity at
    // that particular location when the player reaches that part of the map.
    //
    // example: spawn=enemy-met1=36&spawn=item-e-tank=42
    // yields:  spawn: Map { 36 => "enemy-met1", 42 => "item-e-tank" }
    const spawn = new Map<number, string>()
    celParams.getAll("spawn").forEach((pair) => {
      const [name, id] = pair.split("=", 2)
      spawn.set(Number.parseInt(id ?? ""), name ?? "")
    })

    this.specialTiles = { empty, start, ladder, spike, spawn }
  }

  coordsFor(index: number): [number, number] {
    return [index % this.cel.w, Math.floor(index / this.cel.w)]
  }

  collideTypeAbove(index: number, distance: number = 1) {
    return this._collisionData?.data8[index - this.cel.w * distance]
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

  isTileEmpty(tile: number) {
    return this.specialTiles.empty.includes(tile)
  }

  isTileStartPoint(tile: number) {
    return this.specialTiles.start.includes(tile)
  }

  isTileLadder(tile: number) {
    return this.specialTiles.ladder.includes(tile)
  }

  isTileSpike(tile: number) {
    return this.specialTiles.spike.includes(tile)
  }

  isTileSpawn(tile: number) {
    return this.specialTiles.spawn.has(tile)
  }

  _renderData?: Bytes2D
  get renderData() {
    if (this._renderData) return this._renderData
    const { cel, tilemapMetadata } = this

    const destData = new Uint32Array(cel.w * cel.h)
    new Uint32Array(cel.rawCelData.buffer).forEach((tileBits, index) => {
      let tile = tileBits & tilemapMetadata.bitmaskForTileId

      // Tiles that only mark a position don't render as the tile itself.
      if (this.isTileStartPoint(tile) || this.isTileSpawn(tile)) tile = 0

      destData[index] = tile + 1
    })
    const renderData = new Bytes2D(cel.w, cel.h, 16, 4, destData.buffer)

    this._renderData = renderData
    return renderData
  }

  _collisionData?: Bytes2D
  get collisionData() {
    if (this._collisionData) return this._collisionData

    const collisionData = new Bytes2D(
      this.cel.w,
      this.cel.h,
      GZE.tileSize * 2,
      1,
    )
    this._collisionData = collisionData
    this.tilemapData.forEach((tileBits, index) => {
      collisionData.data8[index] = this.getCollisionTile(tileBits, index)
    })

    return collisionData
  }

  private getCollisionTile(tileBits: number, index: number) {
    const tile = tileBits & this.tilemapMetadata.bitmaskForTileId

    // An empty tile always has no collision.
    if (this.isTileEmpty(tile)) return COLLIDE_NONE

    // If the tile is a start point and we haven't seen another start point yet,
    // take note of its position. Collision is disabled for this point.
    if (this.isTileStartPoint(tile) && !this.noticedStartPoint) {
      const [x, y] = this.coordsFor(index)
      this.noticedStartPoint = new Position(
        x * GZE.tileSize * 2 + GZE.tileSize,
        y * GZE.tileSize * 2 + GZE.tileSize,
      )
      return COLLIDE_NONE
    }

    // If the tile map shows a ladder tile and the tile above it is empty,
    // treat it as a "one-way" tile. You can stand on top of a ladder.
    if (this.isTileLadder(tile)) {
      const tileAbove = this.tileAbove(index)

      // If the tile above is not a ladder, this is the top of the ladder,
      // so we want to take a moment to find the bottom and take note, so we
      // can later create a Climbable entity corresponding to the entire ladder.
      if (!this.isTileLadder(tileAbove)) {
        let ladderHeight = 1
        while (this.isTileLadder(this.tileBelow(index, ladderHeight))) {
          ladderHeight++
        }
        const [ladderTopX, ladderTopY] = this.coordsFor(index)
        this.noticedLadders.push([
          new Position(
            ladderTopX * GZE.tileSize * 2 + GZE.tileSize,
            (ladderTopY + ladderHeight / 2) * GZE.tileSize * 2,
          ),
          new Extents(
            GZE.tileSize,
            ladderHeight * GZE.tileSize + 2, // add 2 so that extents go just past the actual ladder above and below
          ),
        ])
      }

      // If this is the top of the ladder, and the tile above is not collidable,
      // treat this as a "one-way" tile, allowing entities to stand "on top" of
      // a ladder, but not collide at all into the lower parts of it.
      if (
        this.collideTypeAbove(index) === COLLIDE_NONE &&
        !this.isTileLadder(this.tileAbove(index))
      )
        return COLLIDE_ONE_WAY

      // All other ladder tiles are treated as if empty.
      return COLLIDE_NONE
    }

    // If the tile is a spike, take note of its position, but
    // disable collision because the spike entity that gets created
    // will take care of both damage logic and collision.
    if (this.isTileSpike(tile)) {
      const [x, y] = this.coordsFor(index)
      this.noticedSpikes.push(
        new Position(
          x * GZE.tileSize * 2 + GZE.tileSize,
          y * GZE.tileSize * 2 + GZE.tileSize,
        ),
      )
      return COLLIDE_NONE
    }

    // If the tile is a spawning entity, there's no in the tile-based collision;
    // the entity itself will supply collision behavior for whatever it needs.
    // Instead, we merely take note of its kind and its position in the map.
    if (this.isTileSpawn(tile)) {
      const [x, y] = this.coordsFor(index)
      this.noticedSpawns.push([
        this.specialTiles.spawn.get(tile)!,
        new Position(
          x * GZE.tileSize * 2 + GZE.tileSize,
          y * GZE.tileSize * 2 + GZE.tileSize,
        ),
      ])
      return COLLIDE_NONE
    }

    // All other tiles are solid.
    return COLLIDE_SOLID
  }
}
