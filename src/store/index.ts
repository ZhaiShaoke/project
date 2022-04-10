import { createStore } from 'vuex'

declare let SessionStorage: any
const USER = "USER"

const store =  createStore({
  state: {
    user: SessionStorage.get(USER) || {} /*避免空指针异常*/
  },
  mutations: {
    setUser(state,user){
      console.log("store user",user)
      state.user = user
      SessionStorage.set(USER,user)
    }
  },
  actions: {
  },
  modules: {
  }
})


export default store
