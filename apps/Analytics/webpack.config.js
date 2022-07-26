const Dotenv = require("dotenv-webpack");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const mode = process.env.NODE_ENV || "development";
const minimize = mode === "production";
const plugins = [];

if (mode === "production") {
}
module.exports = {
  mode: mode !== "development" ? "production" : mode,
  devtool: "source-map",
  entry: {
    main: [path.resolve(__dirname, "index.js"), path.resolve(__dirname, "index.scss")],
    widgetEditor: [path.resolve(__dirname, "../../gui/src/components/widget/editor/widgetEditorApp.js")],
  },
  output: {
    filename: "[name].js", //main.[contentHash].js
    path: __dirname + "/dist",
  },
  externals: {
    osjs: "OSjs",
    oxziongui: "oxziongui",
  },
  resolve: {
    modules: ["node_modules"],
    alias: {
      react: path.resolve(__dirname, "node_modules/react"),
    },
    extensions: ['.ts','.js','.jsx','.tsx']
  },
  optimization: {
    minimizer: [new CssMinimizerPlugin(), new TerserPlugin()],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "node_modules/@progress/kendo-theme-default/dist/all.css",
          to: "kendo-theme-default-all.css",
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
    new Dotenv({
      path: "./.env",
      safe: true,
    }),
    ...plugins,
  ],
  module: {
    rules: [
      {
        test: /\.html$/,
        use: ["html-loader"],
      },
      {
        test: /\.(svg|png|jpe?g|gif|webp|)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[hash].[ext]",
              outputPath: "images",
            },
          },
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "file-loader",
        options: {
          name: "[name].[hash].[ext]",
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
            presets: [require.resolve("@babel/preset-react"), require.resolve("@babel/preset-env"), require.resolve("@babel/preset-typescript")],
            plugins: [require.resolve("@babel/plugin-transform-runtime"), [require.resolve("@babel/plugin-proposal-class-properties"), { loose: false }]],
          },
        },
      },
    ],
  },
};
