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
  plugins: [
    new webpack.DefinePlugin({
      __IN_DEBUG__: JSON.stringify(true),
      __IN_WORKER__: JSON.stringify(false),
    }),
  ],
})
