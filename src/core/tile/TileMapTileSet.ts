import Aseprite from "ase-parser"
import { BaseTexture } from "glazejs/src/glaze/graphics/texture/BaseTexture"

export default class TileMapTileSet {
  ase: Aseprite
  tileset: Aseprite.Tileset
  rawTilesetData: Buffer

  constructor(ase: Aseprite, index: number) {
    this.ase = ase

    const tileset = ase.tilesets[index]
    if (!tileset) throw new Error(`Aseprite has no tileset at index ${index}`)
    this.tileset = tileset

    const { rawTilesetData } = tileset
    if (!rawTilesetData)
      throw new Error("External file Aseprite tileset not yet implemented")
    this.rawTilesetData = rawTilesetData
  }

  getTexture(gl: WebGLRenderingContext): BaseTexture {
    if (this.ase.colorDepth !== 32)
      throw new Error("Only 32-bit tilesets are supported currently")

    const { tileHeight, tileWidth } = this.tileset
    const tilesPerRow = 1 // TODO: not hard-coded
    const pixelsPerTile = tileWidth * tileHeight
    const pixelsPerTileRow = pixelsPerTile * tilesPerRow
    const totalWidth = tileWidth * tilesPerRow
    const totalHeight = 16 * 255 // TODO: not hard-coded

    const imageData = new ImageData(totalWidth, totalHeight)
    this.rawTilesetData.forEach((byte, byteIndex) => {
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

    const texture = BaseTexture.FromImage(gl, imageData)
    return texture
  }
}
