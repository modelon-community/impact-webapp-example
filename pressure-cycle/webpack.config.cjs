// Generated using webpack-cli https://github.com/webpack/webpack-cli
// TODO: Need to include metadata.json into dist
// TODO: Need to denote how impact knows that dist is the files to be picked up and showed in UI
// TODO: We do not want to have to commit /dist to the repository -> how to solve this?

const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const isProduction = process.env.NODE_ENV == 'production';

const stylesHandler = isProduction ? MiniCssExtractPlugin.loader : 'style-loader';

const config = {
    entry: { // This configures where our application entry point is.
        bundle: path.resolve(__dirname, 'src/index.js'),
    },
    output: { // This configures where to write the bundled files to
        path: path.resolve(__dirname, 'dist'),
        //filename: '[name].js', // name the file bundle.js
        clean: true,
        assetModuleFilename: '[name][ext]',
    },
    devtool: 'source-map', // This adds source mapping to the bundle files, which allows us to read the source code in debug mode
    devServer: { // Configure the dev server
        static: {
            directory: path.resolve(__dirname, 'dist'), 
        },
        port: 3000,
        open: true,
        hot: true,
        compress: true,
        historyApiFallback: true,
        allowedHosts: [ // Adds the host we are working on as allowed as webpack by default inly allows the same host - TODO: Possible to read current host and add?
        '.modelon.com'
        ]
    },
    resolve: {
        extensions: ['.js'], // This allows us to omit the extension (.js) when importing the listed file extensions as modules
        fallback: {
          util: require.resolve("util/")
          // This should probably be fixed in impact-client-js.
          // What if our locally installed version of util differs from the one used by i-c-js for example?
          // The issue is that webpack 5 does not include polyfill by default which seems to be needed by the util package which is a sub-dependency to impact-client-js
          // We should probably build impact-client-js with babel/polyfill
          // see here for explanation of fix:
          // https://stackoverflow.com/questions/64402821/module-not-found-error-cant-resolve-util-in-webpack
        },
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Pressure cycle',
            filename: 'index.html',
            template: 'src/template.html',
        }),
        
        new CopyWebpackPlugin({
            patterns: [
              { from: 'metadata.json', to: 'metadata.json' }, // Adjust the source and destination paths as needed
            ],
        }),

        /*
        // Use to analyze bundle size 
        new BundleAnalyzerPlugin({
            // Default is 8888 and Jupyterlab runs on 8888.
            analyzerPort: 4000,
        }) 
        */
       
        // Add your plugins here
        // Learn more about plugins from https://webpack.js.org/configuration/plugins/
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/i,
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'], // I think this is a preset that lets babel know what browsers etc. to support
                },
                exclude: /node_modules/,
                //include: /node_modules\/@modelon\/impact-client-js/, // Might be needed to load with babel - see above comment about util
            },
            {
                test: /\.css$/i,
                use: [stylesHandler,'css-loader'],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: 'asset',
            },

            // Add your rules for custom modules here
            // Learn more about loaders from https://webpack.js.org/loaders/
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
