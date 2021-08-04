const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const TerserPlugin = require("terser-webpack-plugin");

const mode = process.env.NODE_ENV || "development";
const minimize = mode === "production";
const plugins = [];

if (mode === "production") {
  // plugins.push(
  //   new OptimizeCSSAssetsPlugin({
  //     cssProcessorOptions: {
  //       discardComments: true
  //     }
  //   })
  // );
}

module.exports = {
  mode: mode !== "development" ? "production" : mode,
  devtool: "source-map",
  entry: [
    path.resolve(__dirname, "index.js"),
    path.resolve(__dirname, "index.scss")
  ],
  externals: {
    osjs: "OSjs",
    oxziongui: "oxziongui"
  },
  optimization: {
    minimizer: [
      new TerserPlugin()
    ],
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new CopyWebpackPlugin(["icon.svg", "icon_white.svg", "images/"]),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    ...plugins
  ],
  module: {
    rules: [
      {
        test: /\.(svg|png|jpe?g|gif|webp)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              publicPath: "/apps/Admin"
            }
          }
        ]
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
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "file-loader"
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        include: /typeface/,
        use: {
          loader: "file-loader",
          options: {
            name: "fonts/[name].[ext]",
            publicPath: "apps/Admin"
          }
        }
      },
      {
        test: /\.(sa|sc|c)ss$/,
        // include: [
        //   path.resolve(__dirname, 'src', 'sass')
        // ],
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              sourceMap: true
            }
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              require.resolve("@babel/preset-react"),
              require.resolve("@babel/preset-env")
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