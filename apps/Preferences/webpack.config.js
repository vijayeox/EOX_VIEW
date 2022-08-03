const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const mode = process.env.NODE_ENV || "development";
const minimize = mode === "production";
const plugins = [];

if (mode === "production") {
  plugins.push(
    new OptimizeCSSAssetsPlugin({
      cssProcessorOptions: {
        discardComments: true,
      },
    })
  );
}

module.exports = {
  mode: mode !== "development" ? "production" : mode,
  devtool: "source-map",
  entry: [path.resolve(__dirname, "index.js"), path.resolve(__dirname, "index.scss")],
  externals: {
    osjs: "OSjs",
    oxziongui: "oxziongui",
  },
  optimization: {
    minimize,
  },
  resolve : {
    extensions: ['.ts','.js','.jsx','.tsx']
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new CopyWebpackPlugin(["icon.svg", "icon_white.svg"]),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
    ...plugins,
  ],
  module: {
    rules: [
      {
        test: /\.(svg|png|jpe?g|gif|webp)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              publicPath: "/apps/Admin",
            },
          },
        ],
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        include: /typeface/,
        use: {
          loader: "file-loader",
          options: {
            name: "fonts/[name].[ext]",
            publicPath: "apps/Admin",
          },
        },
      },
      {
        test: /\.mjs$/,
        type: "javascript/auto",
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
            },
          },
          {
            loader: "sass-loader",
            options: {
              minimize,
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.js$|.ts$|.js$|.tsx$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [require.resolve("@babel/preset-react"), require.resolve("@babel/preset-env"),require.resolve("@babel/preset-typescript")],
            plugins: [require.resolve("@babel/plugin-transform-runtime"), [require.resolve("@babel/plugin-proposal-class-properties"), { loose: false }]],
          },
        },
      },
      {
        test: /\.html$/,
        loader: "html-loader",
      },
    ],
  },
  node: {
    fs: "empty",
  },
};
