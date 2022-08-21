import { Rectangle } from "glazejs/src/glaze/geom/Rectangle"
import { Vector2 } from "glazejs/src/glaze/geom/Vector2"
import { Sprite } from "glazejs/src/glaze/graphics/displaylist/Sprite"
import { Frame } from "glazejs/src/glaze/graphics/frame/Frame"
import { GraphicsRenderSystem } from "glazejs/src/glaze/graphics/systems/GraphicsRenderSystem"
import { SpriteTexture } from "glazejs/src/glaze/graphics/texture/SpriteTexture"

import AssetLoader from "../loaders/AssetLoader"

Frame.prototype.updateSprite = function updateSprite(
  sprite: Sprite,
  flipX: number = 1,
  flipY: number = 1,
) {
  sprite.texture = this.texture
  sprite.pivot.x = sprite.texture.frame.width * sprite.texture.pivot.x
  sprite.pivot.y = sprite.texture.frame.height * sprite.texture.pivot.y
  sprite.scale.x = this.scale.x * flipX
  sprite.scale.y = this.scale.y * flipY
}

export default function loadSpriteSheet(
  renderSystem: GraphicsRenderSystem,
  assets: AssetLoader,
  imageAssetName: string,
  spriteAssetName: string,
  framesAssetName: string,
) {
  const { textureManager, frameListManager } = renderSystem

  const texture = textureManager.AddTexture(
    imageAssetName,
    assets.assets.get(imageAssetName),
  )

  const spriteJSON: {
    [key: string]: {
      frame: { x: number; y: number; w: number; h: number }
      pivot: { x: number; y: number }
    }
  } = JSON.parse(assets.assets.get(spriteAssetName))

  Object.keys(spriteJSON).forEach((key) => {
    const { frame, pivot } = spriteJSON[key]!
    textureManager.textures.set(
      key,
      new SpriteTexture(
        texture,
        new Rectangle(frame.x, frame.y, frame.w, frame.h),
        new Vector2(pivot.x / frame.w, pivot.y / frame.h),
      ),
    )
  })

  frameListManager.ParseFrameListJSON(assets.assets.get(framesAssetName))
}
