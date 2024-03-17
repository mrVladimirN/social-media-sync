/* eslint-disable @typescript-eslint/no-var-requires */
const { resolve } = require('path');
const webpack = require('webpack');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const TerserPlugin = require('terser-webpack-plugin');
const { version, dependencies } = require('./package.json');

require('shebang-loader');
require('ts-loader');

module.exports = {
  mode: 'production',
  name: 'social-media-sync',
  entry: {
    'social-media-sync': resolve(__dirname, 'src', 'app-cli.ts'),
    'illustry.min': resolve(__dirname, 'src', 'app-cli.ts')
  },
  output: {
    path: resolve(__dirname, 'build-dist'),
    filename: '[name].js'
  },
  externals: {
    sharp: 'commonjs sharp',
    'xlsx-stream-reader': 'commonjs xlsx-stream-reader'
  },
  devtool: 'source-map',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.js$/i,
        use: { loader: 'shebang-loader' }
      },
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(version),
      DEPENDENCIES: JSON.stringify(dependencies)
    })
  ],
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        include: /\.min\.js(\?.*)?$/i,
        extractComments: {
          condition: false,
          banner: false
        },
        terserOptions: {
          ecma: undefined,
          warnings: true,
          parse: {},
          compress: true,
          mangle: true,
          module: false,
          output: {
            comments: false
          },
          toplevel: false,
          nameCache: null,
          keep_classnames: undefined,
          keep_fnames: false
        }
      })
    ]
  }
};
