import { Engine } from "glaze/ecs/Engine"
import { Position } from "glaze/core/components/Position"
import { Extents } from "glaze/core/components/Extents"
import { PhysicsCollision } from "glaze/physics/components/PhysicsCollision"
import { PhysicsBody } from "glazejs/src/glaze/physics/components/PhysicsBody"
import { Body } from "glazejs/src/glaze/physics/Body"
import { Moveable } from "glazejs/src/glaze/core/components/Moveable"
import { Active } from "glaze/core/components/Active"
import { Graphics } from "glazejs/src/glaze/graphics/components/Graphics"
import { GZE } from "glazejs/src/glaze/GZE"

import GraphicsAnimation from "../../components/GraphicsAnimation"
import DamagesPlayerOnContact from "../../components/DamagesPlayerOnContact"
import PlayerAware from "../../components/PlayerAware"
import FollowsPlayer from "../../components/FollowsPlayer"
import States from "../../components/States"
import ChangesStatesOnPlayerProximity from "../../components/ChangesStatesOnPlayerProximity"

export default function (engine: Engine, position: Position) {
  const entity = engine.createEntity()

  const body = new Body()
  body.maxScalarVelocity = 0
  body.maxVelocity.setTo(100, 630)

  engine.addComponentsToEntity(entity, [
    position,
    new Extents(16, 12),
    new PhysicsCollision(false, null as any, []),
    new PhysicsBody(body, true),
    new Graphics("met1"),
    new GraphicsAnimation("met1", "idle"),
    new Moveable(),
    new Active(),
    new DamagesPlayerOnContact(5),
    new PlayerAware(),
    new FollowsPlayer({
      lookX: true,
      lookHysteresis: GZE.tileSize * 2,
    }),
    new States("idle", {
      idle: { minDuration: 2000 },
      opening: { maxDuration: 300, then: "open" },
      open: { maxDuration: 500, then: "closing" },
      closing: { maxDuration: 300, then: "idle" },
    }),
    new ChangesStatesOnPlayerProximity({
      from: "idle",
      to: "opening",
      proximityX: GZE.tileSize * 6,
      proximityY: GZE.tileSize * 4,
      delay: 500,
    }),
  ])

  return entity
}
