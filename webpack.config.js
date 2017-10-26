'use strict';

const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './js/index.js',
  devtool: 'source-map',
  watch: true,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.bundle.js'
  },
  
  // module: {
  //   rules: [
  //       // {
  //       //   test: require.resolve('index.js'),
  //       //   use: 'imports-loader?this=>window'
  //       // },
  //       {
  //         test: require.resolve('./js/lib/rl'),
  //         use: 'exports-loader?RL'
  //       }
  //   ]
  // },
  
  // externals: {
  //   THREE: {
        
  //   }
  // },
  
  // resolve: {
  //   extensions: ['.js'],
  //   alias: {
  //     'RL': path.resolve(__dirname, './js/lib/rl')
  //   }
  // },
  
  plugins: [
    new webpack.ProvidePlugin({
        //RL: 'RL'
    }),
    new webpack.SourceMapDevToolPlugin({
        filename: '[name].js.map',
        exclude: ['vendor.js']
    })
  ]
};