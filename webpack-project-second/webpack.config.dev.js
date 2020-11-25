const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.config');

module.exports = merge(baseWebpackConfig, {
	mode: 'development',
	// ..其他的一些配置
});