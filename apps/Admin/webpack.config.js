const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const mode = process.env.NODE_ENV || "development";
const minimize = mode === "production";
const plugins = [];

module.exports = {
  mode: mode !== "development" ? "production" : mode,
  devtool: "source-map",
  entry: [
    path.resolve(__dirname, "index.js"),
    path.resolve(__dirname, "index.scss")
  ],
  output: {
    filename: '[name].js', //main.[contentHash].js
    path: __dirname + '/dist'
  },
  externals: {
    osjs: "OSjs",
    oxziongui: "oxziongui"
  },
  optimization: {
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin()
    ],
  },
  resolve : {
    extensions: ['.ts','.js','.jsx','.tsx']
  },
  plugins: [
    // new CopyWebpackPlugin(["icon.svg", "icon_white.svg", "images/"]),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new CleanWebpackPlugin(),
    ...plugins
  ],
  module: {
    rules: [
      {
        test: /\.(svg|png|jpe?g|gif|webp|)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[hash].[ext]",
              outputPath: "images"
            }
          }
        ]
      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "file-loader",
        options: {
          name: "[name].[hash].[ext]",
          outputPath: "font"
        }
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
        sideEffects: true,
      },
      {
        test: /\.js$|.ts$|.js$|.tsx$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              require.resolve("@babel/preset-react"),
              require.resolve("@babel/preset-env"),
              require.resolve("@babel/preset-typescript")
            ],
            plugins: [
              require.resolve("@babel/plugin-transform-runtime"),
              [
                require.resolve("@babel/plugin-proposal-class-properties"),
                { loose: false }
              ]
            ]
          }
        }
      },
      {
        test: /\.(svg|png|jpe?g|gif|webp)$/,
        use: [{
          loader: 'file-loader'
        }]
      },
      {
        test: /\.html$/,
        loader: "html-loader"
      }
    ]
  }
};