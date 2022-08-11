// When a `.aseprite` file is imported, use the correct type.
declare module "*.aseprite" {
  const data: AsepriteLoader.Data
  export default data
}
