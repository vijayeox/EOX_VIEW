const path = require('path');
const mode = process.env.NODE_ENV || 'development';
const minimize = mode === 'production';
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
const {
  DefinePlugin
} = webpack;
// const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const npm = require('./package.json');
const plugins = [];

if (mode === 'production') {
  // plugins.push(new OptimizeCSSAssetsPlugin({
  //   cssProcessorOptions: {
  //     discardComments: true,
  //     map: {
  //       inline: false
  //     }
  //   },
  // }));
}

module.exports = {

  mode: (mode !== 'development' ? 'production' : mode),
  devtool: 'source-map',
  resolve: {
    alias: {
      OxzionGUI: path.resolve(__dirname, "../gui/src")
    }
  },
  entry: {
    osjs: [
      path.resolve(__dirname, 'src/client/index.js'),
      path.resolve(__dirname, 'src/client/assets/scss/index.scss')
    ],
    oxziongui:[
      path.resolve(__dirname, "../gui/index.js")
    ]
  },
  output: {
    library: 'oxziongui',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    sourceMapFilename: '[file].map',
    filename: '[name].js'
  },
  performance: {
    maxEntrypointSize: 600 * 1024,
    maxAssetSize: 600 * 1024
  },
  optimization: {
    minimizer: [
      new TerserPlugin()
      // new UglifyJSPlugin({
      //   sourceMap: true,
      //   uglifyOptions: {
      //     compress: {
      //       inline: false
      //     }
      //   }
      // })
    ],
    runtimeChunk: false,
    splitChunks: {
      cacheGroups: {
        default: false,
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor_app',
          chunks: 'all',
          minChunks: 2
        }
      }
    }
  },
  plugins: [
    new DefinePlugin({
      OSJS_VERSION: npm.version
    }),
    new CopyWebpackPlugin([
      'src/client/assets/images/load.svg',
      'src/client/assets/images/poweredby.png',
      './ViewerJS',
      {from: path.resolve(__dirname, "../gui/src/ckeditor/")},
      {from: path.resolve(__dirname, "../gui/src/public/")}
    ]),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/client/index.ejs'),
      favicon: path.resolve(__dirname, 'src/client/favicon.ico'),
      title: 'EOX Vantage'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new NodePolyfillPlugin(),
    ...plugins
  ],
  module: {
    rules: [{
        test: /\.(svg|png|jpe?g|gif|webp)$/,
        use: [{
          loader: 'file-loader'
        }]
      },
      {
        test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: {
          loader: 'file-loader',

        }
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "url-loader",
        options: {
            limit: 10000,
            mimetype: 'application/font-woff'
        }
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          },
        ]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              '@babel/react', '@babel/env'
            ],
            plugins: [
              require.resolve("@babel/plugin-transform-runtime"),
              '@babel/proposal-class-properties'
            ]
          }
        }
      }
    ]
  }
};
