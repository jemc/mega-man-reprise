// The out-of-the-box TileMapRenderer doesn't work with
// our particular tile data encoding, so we monkey-patch in
// a different fragment shader module that will work.
import { TileMapRenderer } from "glaze/graphics/render/tile/TileMapRenderer"
import { ShaderWrapper } from "glaze/graphics/render/util/ShaderWrapper"
import { CompileProgram } from "glaze/graphics/render/util/WebGLShaderUtil"

// We import the original vertex shader,
// but then we use it with our custom fragment shader.
import vertexShader from "glaze/graphics/render/tile/shaders/tileMap.vert.glsl"
import fragmentShader from "./tileMap.frag.glsl"

// This function should be called sometime after initialization.
export default function monkeyPatchTileMapRenderer(
  gl: WebGLRenderingContext,
  renderer: TileMapRenderer,
) {
  if (!renderer.tilemapShader)
    throw new Error("don't call this until after tilemapShader is initialized")

  // Replace the existing `tileMapShader`.
  renderer.tilemapShader = new ShaderWrapper(
    gl,
    CompileProgram(gl, vertexShader, fragmentShader),
  )
}
