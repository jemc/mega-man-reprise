import { Buffer } from "buffer"
import Aseprite from "ase-parser"

import AssetLoader from "./AssetLoader"

export default class AsepriteLoader {
  mgr: AssetLoader
  url = ""
  req = new XMLHttpRequest()
  data?: Aseprite

  constructor(mgr: AssetLoader) {
    this.mgr = mgr
  }

  Init(url: string) {
    this.url = url
    this.req.open("GET", url, true)
    this.req.responseType = "blob"
    this.req.onload = (event) => {
      const blob: Blob = this.req.response
      blob.arrayBuffer().then((arrayBuffer) => {
        const buffer = Buffer.from(arrayBuffer)
        this.data = new Aseprite(buffer, url)
        this.data.parse()
        this.mgr.onLoad(this)
      })
    }
  }

  Load() {
    this.req.send()
  }

  getKey() {
    return this.url
  }

  getValue() {
    return this.data
  }
}
