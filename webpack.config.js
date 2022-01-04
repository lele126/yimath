const path = require("path");
module.exports = {
	performance: { hints: false },
    mode: 'production', // 生产环境，压缩代码
    // 出口对象中，属性为输出的js文件名，属性值为入口文件
    entry: ["./src/yimath.js","./src/test.js"], //入口文件,从项目根目录指定
    output: { //输出路径和文件名，使用path模块resolve方法将输出路径解析为绝对路径
        library: 'yimath', // 库名字, 取名叫asiaCrypto, 可以直接调用，比如window.asiaCrypto
        libraryTarget: 'umd', // 输出library规范代码, umd是兼容amd和cmd的
        umdNamedDefine: true ,// 会对 UMD 的构建过程中的 AMD 模块进行命名。否则就使用匿名的 define
        // 修改打包出口，在最外级目录打包出一个 index.js 文件，我们 import 默认会指向这个文件
        path: path.resolve(__dirname, './test'),
        filename: "[name].js",
		globalObject: "this",
    },
    devtool: 'eval-source-map',
	devServer: {
	    static: {
	          directory: path.join(__dirname, 'test'),
	        },
	        compress: true,
	        port: 9000,
	  },
};