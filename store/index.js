import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		userid: '', //用户id
		classnum: '', //小班号
		username:''  //用户名
	},
	mutations: {
		handleLogin(state, provider) {
            console.log(state)
            console.log(provider)
		},
	}
})

export default store
