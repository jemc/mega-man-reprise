import Aseprite from "ase-parser"
import { Bytes2D } from "glaze/ds/Bytes2D"
import { TileMapRenderer } from "glaze/graphics/render/tile/TileMapRenderer"
import { BaseTexture } from "glaze/graphics/texture/BaseTexture"
import { LayerToCoordTexture } from "glaze/tmx/TMXMap"
import { TypedArray2D } from "glazejs/src/glaze/ds/TypedArray2D"

export default function loadIntoTileMapRenderer(
  aseData: Aseprite,
  tileMapRenderer: TileMapRenderer,
) {
  const loader = new TileMapLoader(tileMapRenderer.gl, aseData)
  const [fgTilemap, fgTilesetTexture] = loader.load("Foreground")
  const [bgTilemap, bgTilesetTexture] = loader.load("Background")

  tileMapRenderer.SetTileLayerFromData(
    fgTilemap,
    fgTilesetTexture,
    "Foreground",
    1,
    1,
  )
  tileMapRenderer.SetTileLayerFromData(
    bgTilemap,
    bgTilesetTexture,
    "Background",
    1,
    1,
  )
}

class TileMapLoader {
  private gl: WebGLRenderingContext
  private aseData: Aseprite
  private tilesetTextures: BaseTexture[] = []

  constructor(gl: WebGLRenderingContext, aseData: Aseprite) {
    this.gl = gl
    this.aseData = aseData

    if (aseData.colorDepth !== 32)
      throw new Error("non-32 Aseprite color depth not yet implemented")
  }

  load(layerName: string): [TypedArray2D, BaseTexture] {
    const [cel, tilesetIndex] = this.loadCelAndTilesetIndex(layerName)
    const tilemapData = this.loadTileMapData(cel)
    const tilesetTexture = this.loadTilesetTexture(tilesetIndex)
    return [tilemapData, tilesetTexture]
  }

  private loadCelAndTilesetIndex(layerName: string): [Aseprite.Cel, number] {
    // Find the cel in frame zero associated with the right layer.
    let tilesetIndex: number | undefined
    const cel = this.aseData.frames[0].cels.find((cel) => {
      const layer = this.aseData.layers[cel.layerIndex]
      if (layer.name === layerName) {
        tilesetIndex = layer.tilesetIndex
        return true
      }
      return false
    })
    if (!cel)
      throw new Error(
        `Aseprite data has no layer with name '${layerName}' in frame zero`,
      )
    if (tilesetIndex === undefined)
      throw new Error(`Aseprite layer '${layerName}' is has no tile set`)

    return [cel, tilesetIndex]
  }

  private loadTileMapData(cel: Aseprite.Cel): TypedArray2D {
    const { tilemapMetadata } = cel
    if (!tilemapMetadata)
      throw new Error(`Aseprite tile map layer has no tile map metadata`)

    const { bitsPerTile, bitmaskForTileId } = tilemapMetadata
    if (bitsPerTile !== 32)
      throw new Error(`unsupported aseprite tile bit width: ${bitsPerTile}`)

    const destData = new Uint32Array(cel.w * cel.h)
    new Uint32Array(cel.rawCelData.buffer).forEach((tileDatum, index) => {
      const tileId = tileDatum & bitmaskForTileId
      destData[index] = tileId + 1
    })

    return LayerToCoordTexture(
      new Bytes2D(cel.w, cel.h, 16, 4, destData.buffer),
    )
  }

  private loadTilesetTexture(tilesetIndex: number): BaseTexture {
    const existingTexture = this.tilesetTextures[tilesetIndex]
    if (existingTexture) return existingTexture

    const aseTileset = this.aseData.tilesets[tilesetIndex]
    if (!aseTileset)
      throw new Error(`Aseprite data has no tileset number ${tilesetIndex}`)

    if (!aseTileset.rawTilesetData)
      throw new Error("external file Aseprite tileset not yet implemented")

    const { tileHeight, tileWidth } = aseTileset
    const tilesPerRow = 1 // TODO: not hard-coded
    const pixelsPerTile = tileWidth * tileHeight
    const pixelsPerTileRow = pixelsPerTile * tilesPerRow
    const totalWidth = tileWidth * tilesPerRow
    const totalHeight = 16 * 255 // TODO: not hard-coded

    const imageData = new ImageData(totalWidth, totalHeight)
    aseTileset.rawTilesetData.forEach((byte, byteIndex) => {
      const pixelIndex = Math.floor(byteIndex / 4)
      const interPixelIndex = byteIndex % 4

      const subX = pixelIndex % tileWidth
      const subY = Math.floor((pixelIndex % pixelsPerTile) / tileWidth)
      const tileRow = Math.floor(pixelIndex / pixelsPerTileRow)
      const tileCol = Math.floor(
        (pixelIndex % pixelsPerTileRow) / pixelsPerTile,
      )

      const destPixelIndex =
        subX +
        tileCol * tileWidth +
        subY * totalWidth +
        tileRow * tileHeight * totalWidth

      const destByteIndex = destPixelIndex * 4 + interPixelIndex

      imageData.data[destByteIndex] = byte
    })

    const texture = BaseTexture.FromImage(this.gl, imageData)
    this.tilesetTextures[tilesetIndex] = texture

    return texture
  }
}
