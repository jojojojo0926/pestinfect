import http from './interface'

/**
 * 将业务所有接口统一起来便于维护
 * 如果项目很大可以将 url 独立成文件，接口分成不同的模块
 * 
 */

// 单独导出(测试接口) import {post} from '@/common/vmeitime-http/'
export const addCheck = (data) => {
    return http.request({
		baseurl:'http://39.96.82.150/pineinfect/jaxrs/',
        url: 'dataservice/addCheck',
		dataType: 'json',
		method: 'POST',
		data,
    })
}
export const addImage = (data) => {
    return http.request({
		baseurl:'http://39.96.82.150/pineinfect/jaxrs/',
        url: 'dataservice/addImage',
		dataType: 'json',
		method: 'POST',
		data,
    })
}
export const addPine = (data) => {
    return http.request({
		baseurl:'http://39.96.82.150/pineinfect/jaxrs/',
        url: 'dataservice/addpine',
		dataType: 'json',
		method: 'POST',
		data,
    })
}
export const addDeal = (data) => {
    return http.request({
		baseurl:'http://39.96.82.150/pineinfect/jaxrs/',
        url: 'dataservice/adddeal',
		dataType: 'json',
		method: 'POST',
		data,
    })
}
export const addBurn = (data) => {
    return http.request({
		baseurl:'http://39.96.82.150/pineinfect/jaxrs/',
        url: 'dataservice/addburn',
		dataType: 'json',
		method: 'POST',
		data,
    })
}
export const addSmash = (data) => {
    return http.request({
		baseurl:'http://39.96.82.150/pineinfect/jaxrs/',
        url: 'dataservice/addsmash',
		dataType: 'json',
		method: 'POST',
		data,
    })
}
export const addTransport = (data) => {
    return http.request({
		baseurl:'http://39.96.82.150/pineinfect/jaxrs/',
        url: 'dataservice/addtransport',
		dataType: 'json',
		method: 'POST',
		data,
    })
}
// 默认全部导出  import api from '@/common/vmeitime-http/'
export default {
	addCheck,
	addImage,
	addPine,
	addDeal,
	addBurn,
	addSmash,
	addTransport
}