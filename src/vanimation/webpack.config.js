const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const LicenseWebpackPlugin = require('license-webpack-plugin').LicenseWebpackPlugin;


module.exports = [
{
    mode: "development",
    devtool: "source-map",
    entry: {index: path.resolve(__dirname, './vanimation.ts')},
    module: {
      rules: [
        {
          test: /\.js$/,
          enforce: "pre",
          use: ["source-map-loader"],
        },
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
      path: path.resolve(__dirname, '../../dist/vanimation/'),
      assetModuleFilename: '[name][ext]'
    },
    plugins: [
        new LicenseWebpackPlugin(),
        new HtmlWebpackPlugin({
            chunks: ['index'],
            template: "src/vanimation/html/index.html",
            filename: 'index.html',
            inject: 'body',
            path: path.resolve(__dirname, '../../dist/vanimation/'),// Output directory
            publicPath: "/"
        }),
    ],
    devServer: {
        static: path.resolve(__dirname, '../../dist/vanimation/'), // Specify the directory for serving static files
    },
}
];