const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const NpmInstallPlugin = require('npm-install-webpack-plugin');

const TARGET = process.env.npm_lifecycle_event;
const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build')
};

process.env.BABEL_ENV = TARGET;

const common = {
  entry: {
    app: PATHS.app
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  output: {
    path: PATHS.build,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: ['style', 'css'],
        include: PATHS.app
      },
      {
        test: /\.jsx?$/,
        loaders: ['babel?cacheDirectory'],
        include: PATHS.app
      },
      {
      test: /\.json$/,
      // We could restrict using json-loader only on .json files in the
      // node_modules/pixi.js directory, but the ability to load .json files
      // could be useful elsewhere in our app, so I usually don't.
      //include: path.resolve(__dirname, 'node_modules/pixi.js'),
      loaders: ['json'],
      include: PATHS.app
     }
    ],
    // The next errors I encountered were all like:
    //
    // ERROR in ./~/pixi.js/src/core/renderers/webgl/filters/FXAAFilter.js
    // Module not found: Error: Cannot resolve module 'fs' in /Users/michael/Projects/webpack-pixi/node_modules/pixi.js/src/core/renderers/webgl/filters
    // @ ./~/pixi.js/src/core/renderers/webgl/filters/FXAAFilter.js 3:9-22
    //
    // Here, webpack is telling us it doesn't recognize the "fs" module. pixi.js
    // is using node's fs module to read files from the file system and they're
    // expecting people to use Browserify/brfs in order to make this work in
    // browsers. They could be much better about this, and we could go and bother
    // them to write more portable code. But then we'd have to wait for them to
    // cut a new release before we can use their stuff. Isn't there anything we
    // can do in the meantime? Can we somehow use the brfs transform?
    //
    // Webpack lets us use postLoaders to specify a module loader that runs after
    // all other module loaders. In this case, we can use Browserify's brfs
    // transform as a final build step. Here, we restrict this loader to files in
    // the node_modules/pixi.js directory so it won't slow us down too much.
    postLoaders: [
      {
        include: path.resolve(__dirname, 'node_modules/pixi.js'),
        loader: 'transform?brfs'
      }
    ]
  }
};

if(TARGET === 'start' || !TARGET) {
  module.exports = merge(common, {
    devtool: 'eval-source-map',
    devServer: {
      contentBase: PATHS.build,

      historyApiFallback: true,
      hot: true,
      inline: true,
      progress: true,

      // display only errors to reduce the amount of output
      stats: 'errors-only',

      // parse host and port from env so this is easy
      // to customize
      host: process.env.HOST,
      port: process.env.PORT
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new NpmInstallPlugin({
        save: true // --save
      })
    ]
  });
}

if(TARGET === 'build') {
  module.exports = merge(common, {});
}
