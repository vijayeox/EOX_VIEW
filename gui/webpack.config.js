const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const mode = process.env.NODE_ENV || "development";
const minimize = mode === "production";
const plugins = [];

module.exports = {
  output: {
    library: "oxziongui",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "umd",
    umdNamedDefine: true,
    sourceMapFilename: "[file].map",
    filename: "[name].js",
    // clean: true,
  },
  mode,
  devtool: "source-map",
  entry: [path.resolve(__dirname, "index.js")],
  externals: {
    osjs: "OSjs",
  },
  optimization: {
    minimizer: [new CssMinimizerPlugin(), new TerserPlugin()],
    chunkIds: "named",
    splitChunks: {
      cacheGroups: {
        commons: {
          chunks: "initial",
          minChunks: 2,
          maxInitialRequests: 5, // The default limit is too small to showcase the effect
          minSize: 0, // This is example is too small to create commons chunks
        },
        vendor: {
          test: /node_modules/,
          chunks: "initial",
          name: "vendor",
          priority: 10,
          enforce: true,
        },
      },
    },
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: path.resolve(__dirname, "./src/ckeditor") }],
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
    new NodePolyfillPlugin(),
    new HtmlWebpackPlugin({}),
    ...plugins,
  ],
  resolve: {
    alias: {
      OxzionGUI: path.resolve(__dirname, "./src"),
      "react-icons": path.resolve(__dirname, "./node_modules/react-icons"),
    },
    extensions: ['.ts','.js','.jsx','.tsx']
  },
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
        test: /\.js$|.ts$|.js$|.tsx$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            generatorOpts: { compact: false },
            presets: ["@babel/react", "@babel/env",  "@babel/preset-typescript"],
            plugins: [require.resolve("@babel/plugin-transform-runtime"), "@babel/proposal-class-properties"],
          },
        },
      },
    ],
  },
};
