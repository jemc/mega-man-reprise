precision highp float;

varying vec2 pixelCoord;
varying vec2 texCoord;

uniform sampler2D tiles;
uniform sampler2D sprites;

uniform vec2 inverseTileTextureSize;
uniform vec2 inverseSpriteTextureSize;
uniform float tileSize;

void main(void) {
  vec4 tile = texture2D(tiles, texCoord) * 256.0;
  float tileId = floor(tile.r + tile.g * 32.0);

  vec2 spriteOffset = vec2(0.0, tileId) * inverseSpriteTextureSize * 16.0;
  vec2 spriteCoord = mod(pixelCoord, tileSize) * inverseSpriteTextureSize;

  gl_FragColor = texture2D(sprites, (spriteOffset + spriteCoord));
}