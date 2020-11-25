const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: {
		// 将 react 和 react-dom 单独打包成一个动态链接库 记得安装 npm install react react-dom -D
        react: ['react', 'react-dom']
    },
    mode: 'production',
    output: {
		// 将动态链接库单独放在 dll 下。
		// 作用 - 使用 cleanwebpackplugin 更为方便的过滤掉动态链接库。
        filename: '[name].dll.[hash:6].js',
        path: path.resolve(__dirname, 'dist', 'dll'),
        library: '[name]_dll' //暴露给外部使用
        //libraryTarget 指定如何暴露内容，缺省时就是 var
    },
    plugins: [
        new webpack.DllPlugin({
            //name和library一致
            name: '[name]_dll', 
            path: path.resolve(__dirname, 'dist', 'dll', 'manifest.json') //manifest.json的生成路径
        })
    ]
}