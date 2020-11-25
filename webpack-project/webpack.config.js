const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
/* 动态配置页面加载模块
// const isDev = process.env.NODE_ENV === 'development';
// console.log('--- isDev', process.env.NODE_ENV, process.env.NODE_ENV === 'development')
// const config = require('./public/config')[isDev ? 'dev' : 'build']; // 使用的是哪个环境下的配置

// 在 module.exports 中的相关设置
// mode: isDev ? 'development' : 'production', // 开发模式 配置后，使用 npx webpack 进行编译即可，无需使用 npx webpack --mode=development。
//数组 放着所有的webpack插件
new HtmlWebpackPlugin({
	template: './public/index.html',
	filename: 'index.html', //打包后的文件名
	config: config.template // 动态加载 index 中 对应的开发或者生产环境的 模块
})
*/

module.exports = {
	entry: './src/index.js', // webpack的默认配置 可以是字符串，数组，对象
	// entry: [ // 为数组时，表示有“多个主入口”，想要多个依赖文件一起注入时，会这样配置。
	//     './src/polyfills.js', // Polyfill 是一块代码（通常是 Web 上的 JavaScript），用来为旧浏览器提供它没有原生支持的较新的功能。
	//     './src/index.js'
	// ]
	output: {
		path: path.resolve(__dirname, 'dist'), // 必须是绝对路径
		filename: 'bundle.[hash].js',
		publicPath: '/' // 通常是 CDN地址
	},
	// 相应模式的内置优化 - 配置运行打包的方式
	mode: 'development',
	devtool: 'cheap-module-eval-source-map', // 开发环境下使用
	module: {
		rules: [ // 数组
			{ // loader 需要配置在 module.rules 中，loader 是一个对象
				test: /\.jsx?$/, // 匹配规则
				// use: 'babel-loader', // 方式一
				// use: ['babel-loader', 'babel-loader2'], // 方式二
				// 方式三 use数组的每一项可以是字符串也可以是对象，当需要对loader进行配置时，就需要是对象格式，并在 options 中配置
				use: {
					loader: 'babel-loader',
					options: {
						presets: ["@babel/preset-env"],
						plugins: [
							[
								"@babel/plugin-transform-runtime",
								{
									"corejs": 3
								}
							]
						]
					}
				},
				exclude: /node_modules/ // 排除 node_modules 目录
			},
			{
				test: /\.(le|c)ss$/,
				use: ['style-loader', 'css-loader', {
					loader: 'postcss-loader',
					options: {
						plugin: function() {
							return [
								require('autoprefixer')({
									"overrideBrowserslist": [
										// 更多配置查看目标浏览器配置表 https://www.jianshu.com/p/bd9cb7861b85
										">0.25%", // 全球超过 0.25%人使用的浏览器
										"not dead"
									]
								})
							]
						}
					}
				}, 'less-loader']
			},
			{
				test: /\.(png|jpg|gif|jpeg|webp|svg|eot|ttf|woff|woff2)$/,
				use: [{
					loader: 'url-loader',
					options: {
						limit: 10240, //10K 图片大小在 10k 内的转base64 // 想看打包后的，可以将限制改成 1k
						esModule: false, // file-loader 的版本是 5.x 版本之后的，需要增加 esModule 属性
						name: '[name]_[hash:6].[ext]', // 
						outputPath: 'images/' // 打包后的资源统一放置在 dist/images/ 文件夹中
					}
				}]
			},
			{
				test: /.html$/,
				use: 'html-withimg-loader'
			}
		]
	},
	plugins: [
		//数组 放着所有的webpack插件
		new HtmlWebpackPlugin({
			template: './public/index.html',
			filename: 'index.html', //打包后的文件名
			minify: {
				removeAttributeQuotes: false, //是否删除属性的双引号
				collapseWhitespace: false //是否折叠空白
			}
			// hash: true //是否加上hash，默认是 false
		}),
		// 不需要传参数，它可以找到 outputPath
		new CleanWebpackPlugin({
			// 希望dist下的某个文件夹不被清空
			cleanOnceBeforeBuildPatterns: ['**/*', '!dll', '!dll/**'] ,// 不删除dll目录下的文件
			// 希望不删除 dist/images/ 的文件夹，设置 '!images' 即可
		})
	],
	// 在配置了 html-webpack-plugin 的情况下， contentBase (用来指定被访问 html 页面所在目录)不会起任何作用。
	devServer: {
		port: '3000', //默认是8080
		quiet: false, //默认不启用
		inline: true, //默认开启 inline 模式，如果设置为false,开启 iframe 模式
		stats: "errors-only", //终端仅打印 error
		overlay: false, //默认不启用
		clientLogLevel: "silent", //日志等级
		compress: true //是否启用 gzip 压缩
	}
}
