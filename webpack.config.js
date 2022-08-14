"use strict"
const webpack = require("webpack")
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
    fallback: {
      zlib: require.resolve("browserify-zlib"),
      stream: require.resolve("stream-browserify"),
      assert: require.resolve("assert-browserify"),
      buffer: require.resolve("buffer"),
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
  plugins: [
    // We import some NodeJS-oriented code that expects certain global variables
    // to be present, so we use this plugin to provide those from libraries.
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ],
}
