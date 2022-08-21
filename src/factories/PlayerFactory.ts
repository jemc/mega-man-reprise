import { Engine } from "glaze/ecs/Engine"
import { Entity } from "glaze/ecs/Entity"
import { Filter } from "glaze/physics/collision/Filter"
import { Body } from "glaze/physics/Body"
import { Material } from "glaze/physics/Material"
import { Extents } from "glaze/core/components/Extents"
import { Graphics } from "glaze/graphics/components/Graphics"
import { PhysicsBody } from "glaze/physics/components/PhysicsBody"
import { PhysicsCollision } from "glaze/physics/components/PhysicsCollision"
import { Moveable } from "glaze/core/components/Moveable"
import { Active } from "glaze/core/components/Active"
import { Position } from "glaze/core/components/Position"

import { TestFilters } from "glaze/../test/config/Filters"

import { Player } from "../components/Player"
import Health from "../components/Health"
import Climber from "../components/Climber"
import GraphicsAnimation from "../components/GraphicsAnimation"
import DamagesEnemyOnContact from "../components/DamagesEnemyOnContact"
import createExplodeBurst8 from "./projectile/createExplodeBurst8"

export default class PlayerFactory {
  static create(engine: Engine, entity: Entity, position: Position): Entity {
    const playerFilter = new Filter()
    playerFilter.categoryBits = TestFilters.PLAYER_CAT
    playerFilter.groupIndex = TestFilters.PLAYER_GROUP

    const player = new Player({
      height: 22,
      width: 11,
      maxVerticalSpeed: 630,
      maxSlideSpeed: 308,
      maxWalkSpeed: 160,
      minWalkSpeed: 50,
      maxStepSpeed: 70,
      stepForce: 0.1,
      walkForce: 10,
      slideForce: 100,
      slideDurationMillis: 500,
      stopFriction: 0.2,
      shootOffsetX: 36,
      shootOffsetY: 2,
      receivingDamageForce: 1,
      damageImmunityDurationMillis: 1500,
    })

    const body = new Body(new Material(1, 0.3, player.config.stopFriction))
    body.maxScalarVelocity = 0

    const extents = new Extents(player.config.width, player.config.height)

    engine.addComponentsToEntity(entity, [
      player,
      position,
      extents,
      new Graphics("etude"),
      new GraphicsAnimation("etude", "idle"),
      new PhysicsBody(body, true),
      new PhysicsCollision(false, playerFilter, []),
      new Moveable(),
      new Active(),
      new Health({
        max: 100,
        receiveDamageDurationMillis: 500,
        deathAction: createExplodeBurst8,
      }),
      new Climber({
        climbSpeed: 160,
      }),
    ])

    return entity
  }

  static createShot(engine: Engine, position: Position) {
    const shotSpeed = 400

    const body = new Body()
    body.globalForceFactor = 0
    body.maxScalarVelocity = 0
    body.maxVelocity.setTo(shotSpeed, shotSpeed)
    body.velocity.x = shotSpeed * position.direction.x
    body.isBullet = true

    const entity = engine.createEntity()
    engine.addComponentsToEntity(entity, [
      position,
      new Extents(6, 4),
      new Graphics("etude-shot"),
      new GraphicsAnimation("etude-shot", "pellet"),
      new PhysicsBody(body, true),
      new PhysicsCollision(true, null as any, []),
      new DamagesEnemyOnContact("bullet", 1),
      new Moveable(),
      new Active(),
    ])
  }
}
