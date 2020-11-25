const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin'); // index.html引用深层文件时，可自动将目录拷贝到dist中
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 抽离css
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin');// 对抽离的css进行压缩
const isDev = process.env.NODE_ENV === 'development';
const webpack = require('webpack');
const apiMocker = require('mocker-api');
const Happypack = require('happypack');
// const HardSourceWebpackPlugin = require('hard-source-webpack-plugin'); // 为模块提供中间缓存

const SpeedMeasurePlugin  = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();

const config = {
	// entry: './src/index.js', // webpack的默认配置 可以是字符串，数组，对象
	entry: {
		index: './src/index.js',
		login: './src/login.js'
	},
	output: {
		path: path.resolve(__dirname, 'dist'), // 必须是绝对路径
		filename: '[name].[hash:6].js',
		// publicPath: '/' // 通常是 CDN地址
	},
	// 相应模式的内置优化 - 配置运行打包的方式
	mode: isDev ? 'development' : 'production',
	devtool: 'cheap-module-eval-source-map', // 开发环境下使用 - 映射回源码位置
	resolve: { // resolve.modules 配置 webpack 去哪些目录下寻找第三方模块 默认是 node_modules
		// modules: ['./src/components', 'node_modules'], // 从左到右依次查找
		// 假设我们确定 模块 都从根目录下的 node_modules 查找
		modules: [path.resolve(__dirname, 'node_modules'), './src/components'],
		alias: { // 可以配置引入的依赖起别名，引用时使用别名即可
			// 例如：当我需要使用这个依赖时，直接 import { View, ListView} from 'react-native'; 即可
			'react-native': '@my-react-native-web' // 这个包名是我自己随便起的。
		},
		extensions: ['web.js', '.js'] // 当然你还可以配置 .json, css - 适配多端项目中，转端的文件查找。
		// enforceExtension: true // 配置了 改属性值 导入语句不能缺省文件后缀。
		// mainFields: ['style', 'main'] // 如引入 bootstrap，设置引入时默认去查找 css文件，而不是原本的js
	},
	externals: {
		//jquery通过script引入之后，全局中即有了 jQuery 变量
		'jquery': 'jQuery'
	},
	optimization: {
		concatenateModules: false,
		splitChunks: { // 分割代码块
		maxInitialRequests: 6, // 默认是 5
			cacheGroups: {
				vendor: {
					// 第三方依赖
					priority: 1, // 设置优先级，首先抽离第三方模块
					name: 'vendor',
					test: /node_modules/,
					chunks: 'initial',
					minSize: 0,
					minChunks: 1 // 最少引入了1次
				},
				'lottie-web': {
					name: 'lottie-web', // 单独将 react-lottie 拆包
					priority: 5, // 权重需大于 'vendor'
					test: /[\/]node_modules[\/]lottie-web[\/]/,
					chunks: 'initial',
					minSize: 100,
					minChunks: 1 // 重复引入了几次
				},
				// 缓存组
				common: {
					// 公共模块
					chunks: 'initial',
					name: 'common',
					minSize: 100, // 大小超过100个字节
					minChunks: 3 // 最少引入了3次
				}
			}
		},
		runtimeChunk: {
			name: 'mainfest'
		}
	},
	module: {
		noParse: /jquery|lodash/, // 标识第三方模块，不进行转化和解析，提升性能。
		rules: [ // 数组
			{ // loader 需要配置在 module.rules 中，loader 是一个对象
				test: /\.jsx?$/, // 匹配规则
				use: ['thread-loader', 'cache-loader', // babel有自带的缓存 cacheDirectory设置，默认是 false，改为true即可
				{
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
						// cacheDirectory: true // babel的配置缓存
					}
				}],
				include: [path.resolve(__dirname, 'src')]
				// exclude: /node_modules/ // 排除 node_modules 目录
			},
			{
				test: /\.(le|c)ss$/,
				use: 'Happypack/loader?id=css',
				include: [
					path.resolve(__dirname, 'src'),
					path.resolve(__dirname, 'node_modules', 'bootstrap', 'dist')
				]
			},
			{
				test: /\.(png|jpg|gif|jpeg|webp|svg|eot|ttf|woff|woff2)$/,
				use: ['cache-loader', {
					loader: 'url-loader',
					options: {
						limit: 10240, //10K 图片大小在 10k 内的转base64 // 想看打包后的，可以将限制改成 1k
						esModule: false, // file-loader 的版本是 5.x 版本之后的，需要增加 esModule 属性
						name: '[name]_[hash:6].[ext]', // 
						outputPath: 'images/' // 打包后的资源统一放置在 dist/images/ 文件夹中
					}
				}],
				include: [path.resolve(__dirname, 'src')]
			},
			{
				test: /.html$/,
				use: 'html-withimg-loader',
				// 加了 include 之后 index.html 使用 <%= ... %> 有效，但页面的 img标签引入无效
				include: [path.resolve(__dirname, 'src')]
			}
		]
	},
	plugins: [
		// new HardSourceWebpackPlugin(),
		// 作用是忽略地方包的目录 - 忽略 moment 下的 ./locale 目录
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
		// new Happypack({
		// 	id: 'js', // 和 rule 中的id=js对应
		// 	// 将之前 rule 中的 loader 在此配置
		// 	use: ['babel-loader'] // 必须是数组
		// }),
		new Happypack({
			id: 'css',
			// 当 postcss-loader 配置在 Happypack 中时，必须要在项目中创建 postcss.config.js
			use: [ 'style-loader', 'css-loader', 'postcss-loader', 'less-loader' ]
		}),
		//数组 放着所有的webpack插件
		new HtmlWebpackPlugin({
			template: './public/index.html',
			filename: 'index.html', //打包后的文件名
			chunks: ['index'], // 数组类型 - 用于指定页面需要引入的对应js
			minify: {
				removeAttributeQuotes: false, //是否删除属性的双引号
				collapseWhitespace: false //是否折叠空白
			}
			// hash: true //是否加上hash，默认是 false
		}),
		new HtmlWebpackPlugin({
			template: './public/login.html',
			filename: 'login.html',
			chunks: ['login'] // 数组类型 - 用于指定页面需要引入的对应js
		}),
		// manifest.json 用于让 DLLReferencePlugin 映射到相关依赖上。
		new webpack.DllReferencePlugin({
			manifest: path.resolve(__dirname, 'dist', 'dll', 'manifest.json')
		}),
		// 不需要传参数，它可以找到 outputPath
		new CleanWebpackPlugin({
			// 希望dist下的某个文件夹不被清空
			cleanOnceBeforeBuildPatterns: ['**/*', '!dll', '!dll/**', '!js', '!css', '!images'] ,// 不删除dll目录下的文件
			// 希望不删除 dist/images/ 的文件夹，设置 '!images' 即可
		}),
		new CopyWebpackPlugin([
			{
				from: 'public/js/*.js',
				to: path.resolve(__dirname, 'dist', 'js'),
				flatten: true // 为true时 只会拷贝文件，而不会把文件夹路径都拷贝上。
				// 不设置时，会将public/文件夹都拷贝到 dist/js/中，相当于 dist/js/public/js/
			},
			{
				from: 'public/css/*.css',
				to: path.resolve(__dirname, 'dist', 'css'),
				flatten: true
			}
			// 还可以继续配置其他要拷贝的文件
		], {
			ignore: ['other.js'] // 拷贝过程中，过滤掉某个或某些文件，即该文件不会被拷贝过去
		}),
		// webpack 的内置插件 ProvidePlugin，不能过度使用，毕竟全局变量不是什么“好东西”。
		// ProvidePlugin 的作用就是不需要 import 或 require 就可以在项目中到处使用。
		// new webpack.ProvidePlugin({ // 慎用
			// identifier1: 'module1',
			// identifier2: ['module2', 'property2'],
			// React: 'react',
			// Component: ['react', 'Component'],
			// Vue: ['vue/dist/vue.esm.js', 'default'],
			// $: 'jquery',
			// _map: ['lodash', 'map'],
			// 'Promise':'es6-promise',
			// 'fetch':'whatwg-fetch'
		// }),
		new MiniCssExtractPlugin({
			filename: 'css/[name].css' // 个人习惯将 css 文件放在单独目录下
		}),
		new OptimizeCssPlugin(), // 直接配置在 plugin中，可将 js 和 css 一起压缩
		new webpack.HotModuleReplacementPlugin(), // 热更新插件 - 报 webpack is not defind，则在顶部引入下。
		new webpack.DefinePlugin({
			DEV: JSON.stringify('dev'), // 字符串
			FLAG: 'true' // FLAG 是个布尔类型
		})
	],
	// 在配置了 html-webpack-plugin 的情况下， contentBase (用来指定被访问 html 页面所在目录)不会起任何作用。
	devServer: { // 配置 其属性 proxy，可以解决跨域问题。
		port: '3000', //默认是8080
		quiet: false, //默认不启用
		inline: true, //默认开启 inline 模式，如果设置为false,开启 iframe 模式
		stats: "errors-only", //终端仅打印 error
		overlay: false, //默认不启用
		clientLogLevel: "silent", //日志等级
		compress: true, //是否启用 gzip 压缩
		hot: true, // 热更新
		proxy: {
			"/api": {
				target: "http://www.baidu.com/",
				pathRewrite: {
					'/api': ''
				},
				changeOrigin: true,
				secure: false
			}
		},
		before(app) {
			apiMocker(app, path.resolve('./mock/mocker.js'))
		},
		contentBase: path.resolve(__dirname, 'dist')
	}
	// 如果项目启动了 eslint，需要修改下eslint配置，增加以下配置：
	// { // 得手动试下才知道eslint的配置是在哪块区域的
	// 	'globals': {
	// 		"React": true,
	// 		"Vue": true,
	// 		// ...
	// 	}
	// }
}


module.exports = smp.wrap(config);
