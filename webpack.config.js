const path = require('path');
const name = 'todge';

const fileLoader = {
	loader : "file-loader",
	options : {
		name : "[name].[ext]",
		outputPath : "dist/",
		publicPath : "/",
		esModule : false
	}
};

/** @type {import('webpack').Configuration[]} */
module.exports = [
	{
		entry : './app/index.ts',
		context : path.resolve(__dirname, 'src'),
		output : {
			filename : `todge.js`,
			path : path.resolve(__dirname, 'dist')
		},
		module : {
			rules : [
				{
					test : /\.ts$/,
					use : 'ts-loader',
					exclude : /node_modules/
				}
			]
		},
		resolve : {
			extensions : [ '.ts', '.js' ]
		},
		mode : 'development'
	},
	{
		entry : './index.html',
		context : path.resolve(__dirname, 'src'),
		output : {
			filename : './undefined.bundle.js',
			path : path.resolve(__dirname)
		},
		module : {
			rules : [
				{
					test : /\.html$/,
					use : [
						"ignore-loader",
						fileLoader,
						"extract-loader",
						{
							loader : "html-loader",
							options : {
								minimize : true,
								attributes : {
									list : [
										{
											tag : 'img',
											attribute : 'src',
											type : 'src'
										},
										{
											tag : 'link',
											attribute : 'href',
											type : 'src'
										}
									]
								},
							}
						}
					]
				},
				{
					test : /\.css$/,
					use : [
						fileLoader,
						"extract-loader"
					]
				}
			]
		}
	}
];
