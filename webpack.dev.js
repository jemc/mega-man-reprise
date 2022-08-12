const webpack = require("webpack")
const path = require("path")
const merge = require("webpack-merge")
const common = require("./webpack.config.js")

module.exports = merge.merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    static: { directory: path.join(__dirname, "dist") },
    compress: true,
    port: 8000,
  },
  // Don't snapshot-cache the glazejs package.
  // Sometimes we want to make small changes to it
  // to test things and trigger a live reload.
  snapshot: {
    managedPaths: [/^(.+?[\\/]node_modules)[\\/]((?!glazejs)).*[\\/]*/],
  },
  plugins: [
    new webpack.DefinePlugin({
      __IN_DEBUG__: JSON.stringify(true),
      __IN_WORKER__: JSON.stringify(false),
    }),
  ],
})
