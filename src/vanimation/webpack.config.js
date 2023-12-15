const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const LicenseWebpackPlugin = require('license-webpack-plugin').LicenseWebpackPlugin;


module.exports = [
{
    mode: "development",
    entry: {index: path.resolve(__dirname, './vanimation.ts')},
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
      path: path.resolve(__dirname, '../../dist/vanimation/'),
    },
    plugins: [
        new HtmlWebpackPlugin({
            chunks: ['index'],
            template: "src/vanimation/html/index.html",
            filename: 'index.html',
            inject: 'body',
            path: path.resolve(__dirname, '../../dist/vanimation/'),// Output directory
            publicPath: "/"
        }),
        new LicenseWebpackPlugin()
    ],
    devServer: {
        static: path.resolve(__dirname, '../../dist/vanimation/'), // Specify the directory for serving static files
    },
}
];