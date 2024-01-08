const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const { sourceMapsEnabled } = require('process');
const { ImportsNotUsedAsValues } = require('typescript');
const LicenseWebpackPlugin = require('license-webpack-plugin').LicenseWebpackPlugin;


module.exports = [
{
    mode: "development",
    devtool: "source-map",
    optimization: {
      // keep_classnames: true,
    },
    entry: {index: path.resolve(__dirname, './zoomparallax.ts')},
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
            test: /\.css$/i,
            use: ["style-loader", "css-loader"],
        },
        {
          test: /\.html$/i,
          loader: "html-loader",
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, '../../dist/zoomparallax/'),
      assetModuleFilename: '[name][ext]'
    },
    plugins: [
        // new LicenseWebpackPlugin(),
        new HtmlWebpackPlugin({
            chunks: ['index'],
            template: "src/zoomparallax/html/index.html",
            filename: 'index.html',
            inject: 'body',
            path: path.resolve(__dirname, '../../dist/zoomparallax/'),// Output directory
            publicPath: "/"
        }),
    ],
    devServer: {
        static: path.resolve(__dirname, '../../dist/zoomparallax/'), // Specify the directory for serving static files
    },
}
];