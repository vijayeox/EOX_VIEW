const path = require("path");
const mode = process.env.NODE_ENV || "development";
const minimize = mode === "production";
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const { DefinePlugin } = webpack;
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const npm = require("./package.json");
const plugins = [];
// const mode = "production";

module.exports = {
  mode: mode !== "development" ? "production" : mode,
  devtool: "source-map",
  resolve: {
    alias: {
      OxzionGUI: path.resolve(__dirname, "../gui/src"),
    },
    extensions : ['.ts','.js','.tsx', '.jsx']
  },
  entry: {
    osjs: [path.resolve(__dirname, "src/client/index.js"), path.resolve(__dirname, "src/client/assets/scss/index.scss")],
    oxziongui: [path.resolve(__dirname, "../gui/index.js")],
  },
  output: {
    library: "oxziongui",
    libraryTarget: "umd",
    umdNamedDefine: true,
    sourceMapFilename: "[file].map",
    filename: "[name].js",
  },
  performance: {
    maxEntrypointSize: 600 * 1024,
    maxAssetSize: 600 * 1024,
  },
  optimization: {
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
    runtimeChunk: false,
    splitChunks: {
      cacheGroups: {
        default: false,
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor_app",
          chunks: "all",
          minChunks: 2,
        },
      },
    },
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  plugins: [
    new DefinePlugin({
      OSJS_VERSION: npm.version,
    }),
    new CopyWebpackPlugin(["src/client/assets/images/load.svg", "src/client/assets/images/poweredby.png", "./ViewerJS", { from: path.resolve(__dirname, "../gui/src/ckeditor/") }, { from: path.resolve(__dirname, "../gui/src/public/") }]),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src/client/index.ejs"),
      favicon: path.resolve(__dirname, "src/client/favicon.ico"),
      title: "EOX Vantage",
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
    new NodePolyfillPlugin(),
    ...plugins,
  ],
  module: {
    rules: [
      {
        test: /\.(svg|png|jpe?g|gif|webp|)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "images",
            },
          },
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "file-loader",
        options: {
          name: "[name].[ext]",
          outputPath: "font",
        },
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
        sideEffects: true,
      },
      {
        test: /\.js$|.jsx$|.ts$|.tsx$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            generatorOpts: { compact: false },
            presets: ["@babel/react", "@babel/env", "@babel/preset-typescript"],
            plugins: [require.resolve("@babel/plugin-transform-runtime"), "@babel/proposal-class-properties"],
          },
        },
      },
    ],
  },
};
