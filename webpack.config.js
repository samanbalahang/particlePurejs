const glob = require('glob');
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = {
  devtool: "source-map",
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].css'
    }),
  ],
  mode: 'production',
  entry: glob.sync('./asset/**/*.js').reduce(function(obj, el) {
    // Remove 'asset/' prefix and file extension to create output name
    const outputName = path.parse(el.replace(/^asset\//, '')).name;
    obj[outputName] = el;
    return obj;
  }, {}),
  output: {
    filename: 'js/[name].min.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // Cleans the output directory before emit
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.s[ac]ss$/i,
        exclude: /(node_modules|bower_components)/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.less$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "less-loader",
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.css', '.scss', '.js']
  },
  optimization: {
    minimize: true,
  },
};