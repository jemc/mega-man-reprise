import { Bytes2D } from "glazejs/src/glaze/ds/Bytes2D"
import { TileMapRenderer } from "glazejs/src/glaze/graphics/render/tile/TileMapRenderer"
import { BaseTexture } from "glazejs/src/glaze/graphics/texture/BaseTexture"
import { LayerToCoordTexture } from "glazejs/src/glaze/tmx/TMXMap"

export default function loadIntoTileMapRenderer(
  aseMapData: AsepriteLoader.Data,
  tileMapRenderer: TileMapRenderer,
) {
  if (aseMapData.colorDepth !== 32)
    throw new Error("non-32 Aseprite color depth not yet implemented")

  // TODO: Index not hard-coded:
  const imageData = convertAseTileSetToImageData(aseMapData.tilesets[1])
  const baseTexture = BaseTexture.FromImage(tileMapRenderer.gl, imageData)

  const newBackground = asepriteTilemapLayerForRendering(
    aseMapData,
    "Background",
  )
  const newForeground = asepriteTilemapLayerForRendering(
    aseMapData,
    "Foreground",
  )

  tileMapRenderer.SetTileLayerFromData(
    newForeground,
    baseTexture,
    "Foreground",
    1,
    1,
  )
  tileMapRenderer.SetTileLayerFromData(
    newBackground,
    baseTexture,
    "Background",
    1,
    1,
  )
}

function convertAseTileSetToImageData(aseTileset: AsepriteLoader.Tileset) {
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
    const tileCol = Math.floor((pixelIndex % pixelsPerTileRow) / pixelsPerTile)

    const destPixelIndex =
      subX +
      tileCol * tileWidth +
      subY * totalWidth +
      tileRow * tileHeight * totalWidth

    const destByteIndex = destPixelIndex * 4 + interPixelIndex

    imageData.data[destByteIndex] = byte
  })

  return imageData
}

function asepriteTilemapLayerForRendering(
  aseData: AsepriteLoader.Data,
  layerName: string,
) {
  // Find the cel in frame zero associated with the right layer.
  const cel = aseData.frames[0].cels.find((cel) => {
    const layer = aseData.layers[cel.layerIndex]
    return layer.name === layerName
  })
  if (!cel)
    throw new Error(
      `Aseprite data has no layer with name '${layerName}' in frame zero`,
    )

  const { tilemapMetadata } = cel
  if (!tilemapMetadata)
    throw new Error(`Aseprite layer '${layerName}' is not a tile map`)

  const { bitsPerTile, bitmaskForTileId } = tilemapMetadata
  if (bitsPerTile !== 32)
    throw new Error(`unsupported aseprite tile bit width: ${bitsPerTile}`)

  const destData = new Uint32Array(cel.w * cel.h)
  new Uint32Array(cel.rawCelData.buffer).forEach((tileDatum, index) => {
    const tileId = tileDatum & bitmaskForTileId
    destData[index] = tileId + 1
  })

  return LayerToCoordTexture(new Bytes2D(cel.w, cel.h, 16, 4, destData.buffer))
}
