import { AABB2 } from "glaze/geom/AABB2"
import { Camera } from "glaze/graphics/displaylist/Camera"
import { DigitalInput } from "glaze/util/DigitalInput"
import { DynamicTreeBroadphase } from "glaze/physics/collision/broadphase/DynamicTreeBroadphase"
import { GlazeEngine } from "glaze/GlazeEngine"
import { GraphicsRenderSystem } from "glaze/graphics/systems/GraphicsRenderSystem"
import { GZE } from "glaze/GZE"
import { MessageBus } from "glaze/util/MessageBus"
import { Phase } from "glaze/ecs/Phase"
import { PhysicsCollisionSystem } from "glaze/physics/systems/PhysicsCollisionSystem"
import { PhysicsMassSystem } from "glaze/physics/systems/PhysicsMassSystem"
import { PhysicsMoveableSystem } from "glaze/physics/systems/PhysicsMoveableSystem"
import { PhysicsPositionSystem } from "glaze/physics/systems/PhysicsPositionSystem"
import { PhysicsStaticSystem } from "glaze/physics/systems/PhysicsStaticSystem"
import { Position } from "glaze/core/components/Position"
import { PostContactManager } from "glaze/physics/collision/contact/PostContactManager"
import { SpriteRenderer } from "glaze/graphics/render/sprite/SpriteRenderer"
import { StateSystem } from "glaze/core/systems/StateSystem"
import { StateUpdateSystem } from "glaze/core/systems/StateUpdateSystem"
import { TileMapRenderer } from "glaze/graphics/render/tile/TileMapRenderer"
import { Vector2 } from "glaze/geom/Vector2"
import { TileMapCollision } from "glazejs/src/glaze/physics/collision/broadphase/TileMapCollision"
import Aseprite from "ase-parser"

import { PlayerFactory } from "./factories/PlayerFactory"
import { PlayerSystem } from "./systems/PlayerSystem"
import { LadderFactory } from "./factories/LadderFactory"
import ClimbableSystem from "./systems/ClimbableSystem"
import ClimbSystem from "./systems/ClimbSystem"
import AnimationSystem from "./systems/AnimationSystem"
import PhysicsUpdateSystem from "./systems/PhysicsUpdateSystem"
import TileMap from "./core/tile/TileMap"
import monkeyPatchTileMapRenderer from "./core/tile/monkeyPatchTileMapRenderer"

import { monkeyPatchAssetLoaderPrototype } from "./loaders/AssetLoader"
import SpawnFactory from "./factories/SpawnFactory"
monkeyPatchAssetLoaderPrototype()

GZE.resolution = new Vector2(512, 480) // NES resolution * 2

const URL_PARAMS = new URLSearchParams(window.location.search)

const PLAYER_SPRITES_CONFIG = "data/PlayerSprites.json"
const PLAYER_SPRITES_DATA = "data/PlayerSprites.png"
const PLAYER_SPRITES_FRAMES_CONFIG = "data/PlayerSpritesFrames.json"

const TEST_LEVEL_DATA = `data/levels/${
  URL_PARAMS.get("level") || "TestLevel"
}.aseprite`

export default class Game extends GlazeEngine {
  private renderSystem: GraphicsRenderSystem = undefined as any // TODO: fix this
  private tileMap!: TileMap

  constructor(canvas: HTMLCanvasElement, input: DigitalInput) {
    super(canvas, input)

    canvas.style.width = `${GZE.resolution.x * 2}px`
    canvas.style.height = `${GZE.resolution.y * 2}px`

    this.loadAssets([
      PLAYER_SPRITES_CONFIG,
      PLAYER_SPRITES_DATA,
      PLAYER_SPRITES_FRAMES_CONFIG,
      TEST_LEVEL_DATA,
    ])
  }

  initalize() {
    this.engine.addCapacityToEngine(1000)

    this.tileMap = new TileMap(this.assets.assets.get(TEST_LEVEL_DATA))

    this.setupCorePhase()
    this.setupRenderPhase()
    this.createPlayer()
    this.createMappedEntities()

    this.loop.start()
  }

  setupCorePhase() {
    const corePhase = new Phase()
    this.engine.addPhase(corePhase)

    const messageBus = new MessageBus()
    const tileMapCollision = new TileMapCollision(
      this.tileMap.layer("Foreground").collisionData,
    )
    const broadphase = new DynamicTreeBroadphase(tileMapCollision)
    const contactManager = new PostContactManager()

    corePhase.addSystem(new PhysicsMassSystem())
    corePhase.addSystem(new PhysicsStaticSystem(broadphase))
    corePhase.addSystem(new PhysicsMoveableSystem(broadphase))

    corePhase.addSystem(new PhysicsUpdateSystem())
    corePhase.addSystem(new PhysicsCollisionSystem(broadphase, contactManager))
    corePhase.addSystem(new PhysicsPositionSystem())

    corePhase.addSystem(new PlayerSystem(this.input, tileMapCollision))
    corePhase.addSystem(new ClimbableSystem())
    corePhase.addSystem(new ClimbSystem())

    corePhase.addSystem(new StateSystem())
    corePhase.addSystem(new StateUpdateSystem(messageBus))
  }

  setupRenderPhase() {
    const renderPhase = new Phase()
    this.engine.addPhase(renderPhase)

    const aseTileMap: Aseprite = this.assets.assets.get(TEST_LEVEL_DATA)

    const camera = new Camera()
    camera.worldExtentsAABB = new AABB2(
      GZE.tileSize * 2,
      GZE.tileSize * (aseTileMap.width - 4),
      GZE.tileSize * (aseTileMap.height - 4),
      GZE.tileSize * 2,
    )

    this.renderSystem = new GraphicsRenderSystem(
      this.canvas,
      camera,
      GZE.resolution,
    )

    renderPhase.addSystem(
      new AnimationSystem(this.renderSystem.frameListManager),
    )

    const { tileMap } = this
    const tileMapRenderer = new TileMapRenderer(16, 2)
    tileMapRenderer.SetTileRenderLayer("bg", ["Background", "Foreground"])
    tileMapRenderer.SetTileRenderLayer("fg", [])
    this.renderSystem.renderer.AddRenderer(tileMapRenderer)
    monkeyPatchTileMapRenderer(this.renderSystem.renderer.gl, tileMapRenderer)
    tileMap.loadLayerIntoRenderer("Foreground", tileMapRenderer, "Foreground")
    tileMap.loadLayerIntoRenderer("Background", tileMapRenderer, "Background")

    const spriteRender = new SpriteRenderer()
    spriteRender.AddStage(this.renderSystem.stage)
    this.renderSystem.renderer.AddRenderer(spriteRender)

    this.renderSystem.itemContainer.addChild(
      tileMapRenderer.renderLayersMap.get("bg")!.sprite,
    )
    this.renderSystem.camera.addChild(
      tileMapRenderer.renderLayersMap.get("fg")!.sprite,
    )

    renderPhase.addSystem(this.renderSystem)
  }

  createPlayer() {
    this.renderSystem.textureManager.AddTexture(
      PLAYER_SPRITES_DATA,
      this.assets.assets.get(PLAYER_SPRITES_DATA),
    )
    this.renderSystem.textureManager.ParseTexturePackerJSON(
      this.assets.assets.get(PLAYER_SPRITES_CONFIG),
      PLAYER_SPRITES_DATA,
    )
    this.renderSystem.frameListManager.ParseFrameListJSON(
      this.assets.assets.get(PLAYER_SPRITES_FRAMES_CONFIG),
    )

    const playerPosition = this.mapPosition(11, 3)
    PlayerFactory.create(this.engine, playerPosition)
    this.renderSystem.cameraTarget = playerPosition.coords
  }

  createMappedEntities() {
    const tileMapLayer = this.tileMap.layer("Foreground")

    tileMapLayer.noticedLadders.forEach(([ladderPosition, ladderExtents]) => {
      LadderFactory.create(this.engine, ladderPosition, ladderExtents)
    })

    tileMapLayer.noticedSpawns.forEach(([kind, position]) => {
      SpawnFactory.create(this.engine, kind, position)
    })
  }

  mapPosition(xTiles: number, yTiles: number): Position {
    return new Position(
      xTiles * GZE.tileSize * 2 + GZE.tileSize,
      yTiles * GZE.tileSize * 2 + GZE.tileSize,
    )
  }

  preUpdate() {
    this.input.Update(0, 0)
  }

  postUpdate() {}
}
