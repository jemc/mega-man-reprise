import Aseprite from "ase-parser"
import { TileMapRenderer } from "glazejs/src/glaze/graphics/render/tile/TileMapRenderer"
import { LayerToCoordTexture } from "glazejs/src/glaze/tmx/TMXMap"
import TileMapLayer from "./TileMapLayer"
import TileMapTileSet from "./TileMapTileSet"

export default class TileMapLoader {
  ase: Aseprite
  layers = new Map<string, TileMapLayer>()
  tilesets: TileMapTileSet[] = []

  constructor(ase: Aseprite) {
    this.ase = ase
  }

  layer(name: string) {
    let layer = this.layers.get(name)
    if (layer) return layer

    layer = new TileMapLayer(this.ase, name)
    this.layers.set(name, layer)
    return layer
  }

  tileset(index: number) {
    let tileset = this.tilesets[index]
    if (tileset) return tileset

    tileset = new TileMapTileSet(this.ase, index)
    this.tilesets[index] = tileset
    return tileset
  }

  loadLayerIntoRenderer(
    layerName: string,
    renderer: TileMapRenderer,
    renderLayerName: string,
  ) {
    const { gl } = renderer
    const layer = this.layer(layerName)
    const tilemapData = LayerToCoordTexture(layer.renderData)
    const tilesetTexture = this.tileset(layer.tilesetIndex).getTexture(gl)

    renderer.SetTileLayerFromData(
      tilemapData,
      tilesetTexture,
      renderLayerName,
      1,
      1,
    )
  }
}
