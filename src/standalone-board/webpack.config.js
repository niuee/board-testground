const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
console.log(__dirname);
module.exports = [
{
    devtool: 'source-map',
    mode: "development",
    entry: {index: path.resolve(__dirname, './physicsSimulation.ts'), physicsWorker: path.resolve(__dirname, './physicsSimulationWorker.ts')},
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
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, '../../dist/'),
    },
    plugins: [
        new HtmlWebpackPlugin({
            chunks: ['index'],
            template: "src/standalone-board/html/index.html",
            filename: 'index.html',
            inject: 'body',
            path: path.resolve(__dirname, '../../dist/'),// Output directory
            // publicPath: "/"
        })
    ],
    devServer: {
        static: path.resolve(__dirname, '../../dist'), // Specify the directory for serving static files
    },
}
];