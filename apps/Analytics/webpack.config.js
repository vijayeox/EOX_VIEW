const Dotenv = require('dotenv-webpack')
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const mode = process.env.NODE_ENV || 'development';
const minimize = mode === 'production';
const plugins = [];

if (mode === 'production') {
  plugins.push(new OptimizeCSSAssetsPlugin({
    cssProcessorOptions: {
      discardComments: true
    },
  }));
}

module.exports = {
  mode: (mode !== 'development' ? 'production' : mode),
  devtool: 'source-map',
  entry: {
    'main':[
      path.resolve(__dirname, 'index.js'), 
      path.resolve(__dirname, 'index.scss')
    ],
    'widgetEditor':path.resolve(__dirname, 'components/widget/editor/widgetEditorApp.js')
  },
  output: {
    filename: '[name].js',
    path:__dirname + '/dist'
  },
  externals: {
    osjs: 'OSjs'
  },
  optimization: {
    minimize,
  },
  plugins: [
    new CopyWebpackPlugin([
            'icon.png', 
            'icon_white.png', 
            'images/', 
            {from:'static'}, 
            {
                from:'node_modules/@progress/kendo-theme-default/dist/all.css', 
                to:'kendo-theme-default-all.css'
            }
        ]
    ),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new Dotenv({
      path: './.env',
      safe: true
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
              publicPath: "/apps/Analytics"
            }
          }
        ]
      },
      { 
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, 
        loader: "url-loader?limit=10000&mimetype=application/font-woff" 
      },
      { 
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, 
        loader: "file-loader"
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
              minimize,
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.(svg|png|jpe?g|gif|webp)$/,
        use: [{
          loader: 'file-loader'
        }]
      }
    ]
  },
  resolve: {
    modules: ['node_modules']
  }
};
