"use strict"
const path = require("path")

module.exports = {
  entry: "./src/index.ts",
  output: { filename: "./index.js", globalObject: "this" },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: {
          transpileOnly: true,
        },
      },
      {
        test: /\.(glsl|vs|fs)$/,
        loader: "ts-shader-loader",
      },
      {
        test: /\.ase(prite)?$/i,
        loader: "aseprite-loader",
      },
      {
        test: /\.worker\.js$/,
        use: { loader: "worker-loader" },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      glaze: path.resolve(__dirname, "node_modules/glazejs/src/glaze"),
    },
  },
  performance: {
    hints: false,
  },
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  },
}
