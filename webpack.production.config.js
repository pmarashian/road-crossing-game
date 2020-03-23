const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: {
    app: [path.resolve(__dirname, "src/index.js")],
    vendor: ["phaser"],
  },
  mode: "production",
  output: {
    pathinfo: true,
    path: path.resolve(__dirname, "dist"),
    publicPath: "./dist/",
    filename: "[name].bundle.js",
  },
  watch: false,
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      CANVAS_RENDERER: JSON.stringify(true),
      WEBGL_RENDERER: JSON.stringify(true),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ["babel-loader"],
        include: path.join(__dirname, "src"),
      },
    ],
  },
  optimization: {
    splitChunks: {
      name: "vendor",
      chunks: "all",
    },
  },
};
