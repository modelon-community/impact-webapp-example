// Generated using webpack-cli https://github.com/webpack/webpack-cli

require("dotenv").config();
const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const DotenvPlugin = require("dotenv-webpack");

const isProduction = process.env.NODE_ENV == "production";
const stylesHandler = isProduction
  ? MiniCssExtractPlugin.loader
  : "style-loader";
const hostname = new URL(process.env.MODELON_IMPACT_CLIENT_URL).hostname;

// Build into project: CUSTOM_WEB_APPS folder (Resources/CustomWebApps)
const buildPath = path.resolve(
  __dirname,
  "..",
  "Resources",
  "CustomWebApps",
  path.basename(__dirname)
);

const config = {
  entry: {
    bundle: path.resolve(__dirname, "src/index.js"),
    polyfill: ["core-js/stable"],
  },
  output: {
    path: buildPath,
    clean: true,
    assetModuleFilename: "[name][ext]",
  },
  devtool: "source-map",
  devServer: {
    static: {
      directory: buildPath,
    },
    port: 3000,
    open: true,
    hot: true,
    compress: true,
    // Allow current host when developing on impact server
    allowedHosts: [hostname],
    proxy: {
      "/api": {
        changeOrigin: true,
        secure: false,
        target: `${process.env.MODELON_IMPACT_CLIENT_URL}${process.env.JUPYTERHUB_SERVICE_PREFIX}impact/`,
      },
      "/hub": {
        changeOrigin: true,
        secure: false,
        target: `${process.env.MODELON_IMPACT_CLIENT_URL}`,
      },
      "/user": {
        changeOrigin: true,
        secure: false,
        target: `${process.env.MODELON_IMPACT_CLIENT_URL}/`,
      },
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Pressure cycle",
      filename: "index.html",
      template: "src/template.html",
    }),

    new CopyWebpackPlugin({
      // Copy metadata.json to deployment files
      patterns: [{ from: "metadata.json", to: "metadata.json" }],
    }),

    new DotenvPlugin(),
  ],
  resolve: {
    extensions: [".js"],
  },
  module: {
    rules: [
      {
        test: /\.(js)$/i,
        loader: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: [stylesHandler, "css-loader"],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },
    ],
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";
    config.plugins.push(new MiniCssExtractPlugin());
  } else {
    config.mode = "development";
  }
  return config;
};
