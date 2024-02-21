// Generated using webpack-cli https://github.com/webpack/webpack-cli

require('dotenv').config(); 
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const DotenvPlugin = require('dotenv-webpack');

const isProduction = process.env.NODE_ENV == 'production';
const stylesHandler = isProduction ? MiniCssExtractPlugin.loader : 'style-loader';
const hostname = new URL(process.env.MODELON_IMPACT_CLIENT_URL).hostname;

const config = {
    entry: {
        bundle: path.resolve(__dirname, 'src/index.js'),
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        assetModuleFilename: '[name][ext]',
    },
    devtool: 'source-map',
    devServer: {
        static: {
            directory: path.resolve(__dirname, 'dist'), 
        },
        port: 3000,
        open: true,
        hot: true,
        compress: true,
        // Allow current host when developing on impact server
        allowedHosts: [ 
            hostname
        ],
        proxy: {
            "/api": {
                changeOrigin: true,
                secure: false,
                target: `${process.env.MODELON_IMPACT_CLIENT_URL}${process.env.JUPYTERHUB_SERVICE_PREFIX}/impact/`,
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
    resolve: {
        extensions: ['.js'],
        fallback: {
        // TODO: This should probably be fixed in impact-client-js.
        // What if our locally installed version of util differs from the one used by i-c-js for example?
        // The issue is that webpack 5 does not include polyfill by default which seems to be needed by the util package which is a sub-dependency to impact-client-js
        // We should probably build impact-client-js with babel/polyfill
        // see here for explanation of fix:
        // https://stackoverflow.com/questions/64402821/module-not-found-error-cant-resolve-util-in-webpack
          util: require.resolve("util/")
        },
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Pressure cycle',
            filename: 'index.html',
            template: 'src/template.html',
        }),
        
        new CopyWebpackPlugin({
            // Copy metadata.json to deployment files
            patterns: [
              { from: 'metadata.json', to: 'metadata.json' },
            ],
        }),

        new DotenvPlugin(),
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/i,
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'],
                },
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: [stylesHandler,'css-loader'],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: 'asset',
            },
        ],
    },
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';
        config.plugins.push(new MiniCssExtractPlugin());        
        
    } else {
        config.mode = 'development';
    }
    return config;
};
