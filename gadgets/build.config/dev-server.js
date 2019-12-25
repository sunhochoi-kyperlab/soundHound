require('./check-versions')()
var config = require('../config')
if (!process.env.NODE_ENV) process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
var path = require('path')
var express = require('express')
var webpack = require('webpack')
var opn = require('opn')
var proxyMiddleware = require('http-proxy-middleware')
var webpackConfig = process.env.NODE_ENV === 'testing'
  ? require('./webpack.prod.conf')
  : require('./webpack.dev.conf')

var AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var argv = require('minimist')(process.argv.slice(2))

var carModel = (argv.model) ? argv.model : config.model

var copyassetPlugin =  new CopyWebpackPlugin([
  { from: path.join(__dirname, '../../../node_modules/obigo-js-ui-rnbs-' + carModel + '/icon/') + '*.*', to: './icon', flatten: true},
  { from: path.join(__dirname, '../../../node_modules/obigo-js-ui-rnbs-' + carModel + '/font/') + '*.*', to: './font', flatten: true}
])

var addAssetPlugin = new AddAssetHtmlPlugin(
  [{ filepath: '../node_modules/obigo-js-ui-rnbs-' + carModel + '/index.css', includeSourcemap: false, typeOfAsset: 'css' }]
)

webpackConfig.plugins[9] = addAssetPlugin
webpackConfig.plugins.push(copyassetPlugin)

// default port where dev server listens for incoming traffic
var port = process.env.PORT || config.dev.port
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
var proxyTable = config.dev.proxyTable

var app = express()
var compiler = webpack(webpackConfig)

var devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: '/',
  quiet: true
})

var hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: () => {}
})
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({ action: 'reload' })
    cb()
  })
})

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(context, options))
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// serve pure static assets
var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
//app.use(staticPath, express.static('./static'))
app.use(express.static('src/assets'))

var uri = 'http://localhost:' + port

devMiddleware.waitUntilValid(function () {
  console.log('> Listening at ' + uri + '\n')
})

module.exports = app.listen(port, function (err) {
  if (err) {
    console.log(err)
    return
  }

  // when env is testing, don't need open it
  if (process.env.NODE_ENV !== 'testing') {
    // opn(uri)
  }
})
