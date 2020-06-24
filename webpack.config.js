const path = require('path');

/** @type {import('webpack').Configuration} */
module.exports = {
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
