var webpack = require("webpack");
var UglifyJSPlugin = require('uglify-es-webpack-plugin')

var prod = true;

module.exports = {
  entry: "./main.js",
  output: {
    path: __dirname + '/build',
    filename: prod ? "bundle.min.js" : 'bundle.js'
  },
  plugins: prod ? [
    new UglifyJSPlugin({
      ie8: true,
      ecma: 8,
      mangle: true,
      output: {
        comments: false,
        beautify: false,
      },
      compress: true,
      warnings: false
    })
  ] : []
};