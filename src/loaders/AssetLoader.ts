import { AssetLoader } from "glazejs/src/glaze/util/AssetLoader"

import AsepriteLoader from "./AsepriteLoader"

// Monkey-patch the AssetLoader to allow loading other asset types.
export function monkeyPatchAssetLoaderPrototype() {
  const originalLoaderFactory = AssetLoader.prototype["LoaderFactory"]

  AssetLoader.prototype["LoaderFactory"] = function LoaderFactory(url: string) {
    if (url.endsWith(".aseprite")) return new AsepriteLoader(this)

    return originalLoaderFactory.call(this, url)
  }
}

export default AssetLoader
