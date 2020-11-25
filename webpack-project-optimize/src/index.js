import './index.less';
import Dialog from 'dialog'; // 不用写具体的路径，直接写文件名 - 因为已经配置了 resolve
console.log(Dialog)
import react from 'react'

class Animal {
	constructor (name) {
		this.name = name
	}
	getName () {
		return this.name
	}
}

const dog = new Animal('dog')
console.log('aaa');

// 跨域 // .then(response => response.json())
fetch("/api/s?wd=中国航天") // 可以到百度一下，能看到Network中返回的相应信息 是一个页面text不是json
	.then(response => response.text())
	.then(data => console.log(data))
	.catch(err => console.log(err));

// mock的mocker.js
// GET
// fetch("/user")
// 	.then(response => response.json())
// 	.then(data => console.log(data))
// 	.catch(err => console.log(err));
// POST
// fetch("/login/account", {
//     method: "POST",
//     headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//         username: "admin",
//         password: "888888"
//     })
// })
//     .then(response => response.json())
//     .then(data => console.log(data))
//     .catch(err => console.log(err));







// 修改代码，整个页面不会都刷新
if (module && module.hot) {
	module.hot.accept()
}

// 根据环境 使用不同域名
let url = "";
if(DEV === 'dev') {
	// 开发环境
	url = "http://localhost:8000";
} else {
	// 生产环境
	url = "http://www.baidu.com";
}