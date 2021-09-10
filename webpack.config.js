const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const mode = process.env.NODE_ENV || "development";
const devtool = process.env.NODE_ENV !== "production" ? "eval-source-map" : false;

/** @type {import('webpack-dev-server').Configuration} */
const devServer = {
	compress : true,
	port : 8000,
	static : [
		{
			directory : path.resolve(__dirname, "public")
		}
	]
}



/** @type {import('webpack').Configuration} */
const configurations = {
	entry : ['./src/app/index.ts', './src/todge.css'],
	output : {
		filename : 'todge.js',
		clean : true
	},
	module : {
		rules : [
			{
				test : /\.ts$/,
				use : 'ts-loader',
				exclude : /node_modules/
			},
			{
				test : /\.css$/i,
				use : [
					{
						loader : MiniCssExtractPlugin.loader,
						options : {
							esModule : false,
						}
					},
					{
						loader :'css-loader',
						options : {
							esModule : false,
							sourceMap : process.env.NODE_ENV !== 'production'
						}
					},
				]
			},
			{
				test : /\.md$/i,
				type : "asset/source",
				use : [
					"markdown-loader"
				]
			}
		]
	},
	resolve : {
		extensions : [ '.ts', '.js' ]
	},
	mode,
	devtool,
	devServer,
	plugins : [
		new HtmlWebpackPlugin({
			template : require.resolve(__dirname, "src", "todge.ejs"),
			filename : "todge.html",
			minify : {
				collapseWhitespace: true,
				collapseInlineTagWhitespace : true,
				removeComments: true,
				removeRedundantAttributes: true,
				removeScriptTypeAttributes: true,
				removeStyleLinkTypeAttributes: true,
				useShortDoctype: true
			}
		}),
		new MiniCssExtractPlugin({
			filename : "todge.css"
		})
	]
}

module.exports = configurations;

