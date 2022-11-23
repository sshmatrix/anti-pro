const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInjectAttributesPlugin = require('html-webpack-inject-attributes-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  resolve: {
    fallback: {
      fs: false,
      path: false,
      util: false
    }
  },
  experiments: {
    topLevelAwait: true,
  },
  output: {
    filename: 'main.js',
    path: path.join(__dirname,'/build'),
    publicPath: ''
  },
  externals: {
    'Config': JSON.stringify(process.env.NODE_ENV === 'production' ? {
      serverUrl: ""
    } : {
      serverUrl: "http://localhost:3000"
    })
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      path: path.join(__dirname,'/build')
    }),
    new HtmlWebpackInjectAttributesPlugin({
      args: 'none',
    })
  ]
};
