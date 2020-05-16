const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: "./src/index.ts",
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  devtool: "inline-source-maps",
  output: {
    path: path.join(__dirname, "/dist"),
    filename: "bundle.min.js"
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      },
      {
        test: /\.css$/,
        loader: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /.(ttf|png)$/,
        loader: 'file-loader'
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      template: "./src/index.html"
    })
  ]
};
