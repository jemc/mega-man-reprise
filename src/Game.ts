import { AABB2 } from "glaze/geom/AABB2"
import { DigitalInput } from "glaze/util/DigitalInput"
import { DynamicTreeBroadphase } from "glaze/physics/collision/broadphase/DynamicTreeBroadphase"
import { Entity } from "glazejs/src/glaze/ecs/Entity"
import { GlazeEngine } from "glaze/GlazeEngine"
import { GraphicsRenderSystem } from "glaze/graphics/systems/GraphicsRenderSystem"
import { GZE } from "glaze/GZE"
import { Phase } from "glaze/ecs/Phase"
import { PhysicsCollisionSystem } from "glaze/physics/systems/PhysicsCollisionSystem"
import { PhysicsMassSystem } from "glaze/physics/systems/PhysicsMassSystem"
import { PhysicsMoveableSystem } from "glaze/physics/systems/PhysicsMoveableSystem"
import { PhysicsPositionSystem } from "glaze/physics/systems/PhysicsPositionSystem"
import { PhysicsStaticSystem } from "glaze/physics/systems/PhysicsStaticSystem"
import { Position } from "glaze/core/components/Position"
import { PostContactManager } from "glaze/physics/collision/contact/PostContactManager"
import { SpriteRenderer } from "glaze/graphics/render/sprite/SpriteRenderer"
import { TileMapCollision } from "glazejs/src/glaze/physics/collision/broadphase/TileMapCollision"
import { TileMapRenderer } from "glaze/graphics/render/tile/TileMapRenderer"
import { Vector2 } from "glaze/geom/Vector2"
import Aseprite from "ase-parser"

import { Camera } from "./core/camera/Camera"

import HealthDisplayFactory from "./factories/HealthDisplayFactory"
import LadderFactory from "./factories/LadderFactory"
import PlayerFactory from "./factories/PlayerFactory"
import SpawnFactory from "./factories/SpawnFactory"
import SpikeFactory from "./factories/SpikeFactory"

import AnimationSystem from "./systems/AnimationSystem"
import ChangesStatesOnPlayerProximitySystem from "./systems/ChangesStatesOnPlayerProximitySystem"
import ClimbableSystem from "./systems/ClimbableSystem"
import ClimbSystem from "./systems/ClimbSystem"
import DamagesEnemyOnContactSystem from "./systems/DamagesEnemyOnContactSystem"
import DamagesPlayerOnContactSystem from "./systems/DamagesPlayerOnContactSystem"
import ExtentsFollowSpriteExtentsSystem from "./systems/ExtentsFollowSpriteExtentsSystem"
import FollowsPlayerSystem from "./systems/FollowsPlayerSystem"
import HealthUpdateSystem from "./systems/HealthUpdateSystem"
import HUDPositioningSystem from "./systems/HUDPositioningSystem"
import PhysicsUpdateSystem from "./systems/PhysicsUpdateSystem"
import PlayerAwareSystem from "./systems/PlayerAwareSystem"
import PlayerSystem from "./systems/PlayerSystem"
import SegmentedDisplaySystem from "./systems/SegmentedDisplaySystem"
import SpawnOnCameraArrivalSystem from "./systems/SpawnOnCameraArrivalSystem"
import StatesGraphicsSystem from "./systems/StatesGraphicsSystem"
import StatesHealthSystem from "./systems/StatesHealthSystem"

import TileMap from "./core/tile/TileMap"
import monkeyPatchTileMapRenderer from "./core/tile/monkeyPatchTileMapRenderer"
import { monkeyPatchAssetLoaderPrototype } from "./loaders/AssetLoader"
import loadSpriteSheet from "./sprite/loadSpriteSheet"
monkeyPatchAssetLoaderPrototype()

GZE.resolution = new Vector2(512, 480) // NES resolution * 2

const URL_PARAMS = new URLSearchParams(window.location.search)

const PLAYER_SPRITES_CONFIG = "data/PlayerSprites.json"
const PLAYER_SPRITES_DATA = "data/PlayerSprites.png"
const PLAYER_SPRITES_FRAMES_CONFIG = "data/PlayerSpritesFrames.json"

const ENEMY_SPRITES_CONFIG = "data/EnemySprites.json"
const ENEMY_SPRITES_DATA = "data/EnemySprites.png"
const ENEMY_SPRITES_FRAMES_CONFIG = "data/EnemySpritesFrames.json"

const TEST_LEVEL_DATA = `data/levels/${
  URL_PARAMS.get("level") || "TestLevel"
}.aseprite`

export default class Game extends GlazeEngine {
  private renderSystem: GraphicsRenderSystem = undefined as any // TODO: fix this

  private tileMap!: TileMap
  private player!: Entity
  private playerPosition!: Position

  constructor(canvas: HTMLCanvasElement, input: DigitalInput) {
    super(canvas, input)

    canvas.style.width = `${GZE.resolution.x * 2}px`
    canvas.style.height = `${GZE.resolution.y * 2}px`

    this.loadAssets([
      PLAYER_SPRITES_CONFIG,
      PLAYER_SPRITES_DATA,
      PLAYER_SPRITES_FRAMES_CONFIG,
      ENEMY_SPRITES_CONFIG,
      ENEMY_SPRITES_DATA,
      ENEMY_SPRITES_FRAMES_CONFIG,
      TEST_LEVEL_DATA,
    ])
  }

  initalize() {
    this.engine.addCapacityToEngine(1000)

    this.tileMap = new TileMap(this.assets.assets.get(TEST_LEVEL_DATA))
    this.player = this.engine.createEntity("player")
    this.playerPosition = new Position(0, 0)

    this.setupCorePhase()
    this.setupReactionPhase()
    this.setupRenderPhase()
    this.createMappedEntities()
    this.createPlayer()
    this.createHUDEntities()

    this.loop.start()
  }

  setupCorePhase() {
    const phase = new Phase()
    this.engine.addPhase(phase)

    const tileMapCollision = new TileMapCollision(
      this.tileMap.layer("Foreground").collisionData,
    )
    const broadphase = new DynamicTreeBroadphase(tileMapCollision)
    const contactManager = new PostContactManager()

    phase.addSystem(new PhysicsMassSystem())
    phase.addSystem(new PhysicsStaticSystem(broadphase))
    phase.addSystem(new PhysicsMoveableSystem(broadphase))

    const physicsUpdate = new PhysicsUpdateSystem()
    physicsUpdate.globalDamping = 1
    phase.addSystem(physicsUpdate)
    phase.addSystem(new PhysicsCollisionSystem(broadphase, contactManager))
    phase.addSystem(new PhysicsPositionSystem())

    phase.addSystem(new DamagesEnemyOnContactSystem())
    phase.addSystem(new DamagesPlayerOnContactSystem())
    phase.addSystem(new HealthUpdateSystem())

    phase.addSystem(new PlayerSystem(this.input, tileMapCollision))
  }

  setupReactionPhase() {
    const phase = new Phase()
    this.engine.addPhase(phase)

    phase.addSystem(new PlayerAwareSystem(this.player, this.playerPosition))
    phase.addSystem(new FollowsPlayerSystem())

    phase.addSystem(new ChangesStatesOnPlayerProximitySystem())
    phase.addSystem(new ClimbableSystem())
    phase.addSystem(new ClimbSystem())

    phase.addSystem(new StatesGraphicsSystem())
    phase.addSystem(new StatesHealthSystem())

    phase.addSystem(new SegmentedDisplaySystem())
  }

  setupRenderPhase() {
    const phase = new Phase()
    this.engine.addPhase(phase)

    const aseTileMap: Aseprite = this.assets.assets.get(TEST_LEVEL_DATA)

    const camera = new Camera()
    camera.worldExtentsAABB = new AABB2(
      0,
      aseTileMap.width * 2,
      aseTileMap.height * 2,
      0,
    )

    this.renderSystem = new GraphicsRenderSystem(
      this.canvas,
      camera,
      GZE.resolution,
    )
    this.renderSystem.cameraTarget = this.playerPosition.coords

    phase.addSystem(new AnimationSystem(this.renderSystem.frameListManager))

    phase.addSystem(new ExtentsFollowSpriteExtentsSystem())

    const { tileMap } = this
    const tileMapRenderer = new TileMapRenderer(16, 2)
    tileMapRenderer.SetTileRenderLayer("bg", ["Background", "Foreground"])
    tileMapRenderer.SetTileRenderLayer("fg", [])
    this.renderSystem.renderer.AddRenderer(tileMapRenderer)
    monkeyPatchTileMapRenderer(this.renderSystem.renderer.gl, tileMapRenderer)
    tileMap.loadLayerIntoRenderer("Foreground", tileMapRenderer, "Foreground")
    tileMap.loadLayerIntoRenderer("Background", tileMapRenderer, "Background")

    camera.rooms = tileMap.loadRooms()

    const spriteRender = new SpriteRenderer()
    spriteRender.AddStage(this.renderSystem.stage)
    this.renderSystem.renderer.AddRenderer(spriteRender)

    this.renderSystem.itemContainer.addChild(
      tileMapRenderer.renderLayersMap.get("bg")!.sprite,
    )
    this.renderSystem.camera.addChild(
      tileMapRenderer.renderLayersMap.get("fg")!.sprite,
    )

    phase.addSystem(new HUDPositioningSystem(this.renderSystem.camera))
    phase.addSystem(this.renderSystem)

    phase.addSystem(new SpawnOnCameraArrivalSystem(this.renderSystem.camera))

    // Load textures.
    // this.renderSystem.textureManager.AddTexture(
    //   PLAYER_SPRITES_DATA,
    //   this.assets.assets.get(PLAYER_SPRITES_DATA),
    // )
    // this.renderSystem.textureManager.ParseTexturePackerJSON(
    //   this.assets.assets.get(PLAYER_SPRITES_CONFIG),
    //   PLAYER_SPRITES_DATA,
    // )
    // this.renderSystem.frameListManager.ParseFrameListJSON(
    //   this.assets.assets.get(PLAYER_SPRITES_FRAMES_CONFIG),
    // )
    loadSpriteSheet(
      this.renderSystem,
      this.assets,
      PLAYER_SPRITES_DATA,
      PLAYER_SPRITES_CONFIG,
      PLAYER_SPRITES_FRAMES_CONFIG,
    )
    loadSpriteSheet(
      this.renderSystem,
      this.assets,
      ENEMY_SPRITES_DATA,
      ENEMY_SPRITES_CONFIG,
      ENEMY_SPRITES_FRAMES_CONFIG,
    )
  }

  createMappedEntities() {
    const tileMapLayer = this.tileMap.layer("Foreground")

    if (tileMapLayer.noticedStartPoint) {
      this.playerPosition.coords.setTo(
        tileMapLayer.noticedStartPoint.coords.x,
        tileMapLayer.noticedStartPoint.coords.y - 2, // TODO: use player extents instead of hard-coding the -2
      )
      this.renderSystem.camera.position.setTo(
        -this.playerPosition.coords.x +
          this.renderSystem.camera.halfViewportSize.x,
        -this.playerPosition.coords.y +
          this.renderSystem.camera.halfViewportSize.y,
      )
    }

    tileMapLayer.noticedLadders.forEach(([ladderPosition, ladderExtents]) => {
      LadderFactory.create(this.engine, ladderPosition, ladderExtents)
    })

    tileMapLayer.noticedSpikes.forEach((spikePosition) => {
      SpikeFactory.create(this.engine, spikePosition)
    })

    tileMapLayer.noticedSpawns.forEach(([kind, position]) => {
      SpawnFactory.create(this.engine, kind, position)
    })
  }

  createPlayer() {
    PlayerFactory.create(this.engine, this.player, this.playerPosition)
  }

  createHUDEntities() {
    HealthDisplayFactory.create(this.engine, this.player)
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
