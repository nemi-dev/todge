const path = require('path');

/** @type {import('webpack').Configuration[]} */
module.exports = [
	{
		entry : './src/index.html',
		output : {
			filename : './undefined.js',
			path : path.resolve(__dirname)
		},
		module : {
			rules : [
				{
					test : /\.html$/,
					use : [
						"ignore-loader",
						"extract-loader",
						{
							loader : "file-loader",
							options : {
								name : "[name].[ext]",
								outputPath : "dist/",
								esModule : false
							}
						}
					]
				}
			]
		}
	},

	{
		entry : './app/index.ts',
		output : {
			filename : 'app.js',
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
	}
];
