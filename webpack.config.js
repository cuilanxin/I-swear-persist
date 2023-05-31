const path = require('path')

const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// const WebglHtmlPlugin = require('./plugins/webgl-html-plugin')

module.exports = {
  mode: 'development',
  // entry: './src/js/index.js',
  entry: {
    index: './src/index'
    // gl: './src/drop-draw/index'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[chunkhash:5]].js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts/,
        loader: 'ts-loader'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './public/index.html' }),
    new CleanWebpackPlugin()
    // new WebglHtmlPlugin({
    //   htmlName: 'index.html',
    //   paths: ['./src/webgl/fragment-shader.webgl', './src/webgl/vertex-shader.webgl']
    // })
  ],
  devServer: {
    port: 8000,
    hot: true // 热替换
    // open: true
    // openPage: 'html/'
    // index: "" // 默认访问路径
    // proxy: {
    //   xxx: { target: "xxxx", changeOrigin: true }
    // } // 代理
  },
  stats: 'errors-only'
}
