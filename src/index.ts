import Game from "./Game"

import { DigitalInput } from "glazejs/src/glaze/util/DigitalInput"
import { Vector2 } from "glazejs/src/glaze/geom/Vector2"

const canvas = document.getElementById("view") as HTMLCanvasElement
const input = new DigitalInput()
const rect = canvas.getBoundingClientRect()
input.InputTarget(document, new Vector2(rect.left, rect.top))

new Game(canvas, input)
