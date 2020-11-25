// 利用 html-webpack-plugin 插件，结合该配置文件，实现页面动态加载模块内容
module.exports = {
	dev: {
		template: {
			title: '你好',
			header: false,
			footer: false
		}
	},
	build: {
		template: {
			title: '你不好',
			header: true,
			footer: false
		}
	}
}