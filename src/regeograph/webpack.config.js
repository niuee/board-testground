const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const LicenseWebpackPlugin = require('license-webpack-plugin').LicenseWebpackPlugin;


module.exports = [
{
    mode: "development",
    devtool: "source-map",
    entry: {index: path.resolve(__dirname, './index.ts')},
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
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, '../../dist/regeograph/'),
    },
    plugins: [
        new HtmlWebpackPlugin({
            chunks: ['index'],
            template: "src/regeograph/html/index.html",
            filename: 'index.html',
            inject: 'body',
            path: path.resolve(__dirname, '../../dist/regeograph/'),// Output directory
            publicPath: "/",
        }),
        new LicenseWebpackPlugin()
    ],
    devServer: {
        static: path.resolve(__dirname, '../../dist/regeograph/'), // Specify the directory for serving static files
    },
}
];