<template>
  <a-layout-header class="header">
    <div class="logo" >甲蛙知识库</div>
    <a-menu
        theme="dark"
        mode="horizontal"
        :style="{ lineHeight: '64px' }"
    >
      <a-menu-item key="/">
        <router-link to="/">Home Page</router-link>
      </a-menu-item>
      <a-menu-item key="/admin/user" :style="user.id? {} : {display:'none'}">
        <router-link to="/admin/user">User management</router-link>
      </a-menu-item>
      <a-menu-item key="/admin/ebook" :style="user.id? {} : {display:'none'}">
        <router-link to="/admin/ebook">Electronic Book</router-link>
      </a-menu-item>
      <a-menu-item key="/admin/category" :style="user.id? {} : {display:'none'}">
        <router-link to="/admin/category" >Classified management</router-link>
      </a-menu-item>

      <a-menu-item  key="/about">
        <router-link to="/about">About Us</router-link>
      </a-menu-item>

      <a class="login-menu" v-show="user.id">
        <span>Hello,{{user.loginName}}</span>
      </a>
      <a class="login-menu" v-show="!user.id" @click="showLoginModal">
        <span>Sign in</span>
      </a>

      <a-popconfirm
          title="Are you sure to log out?"
          ok-text="Yes"
          cancel-text="No"
          @confirm="logout()"
      >
        <a class="logout-menu" v-show="user.id">
          <span>Sign out</span>
        </a>
      </a-popconfirm>


    </a-menu>

    <a-modal
        title="登录"
        v-model:visible="loginModalVisible"
        :confirm-loading="loginModalLoading"
        @ok="login"
    >
      <a-form :model="loginUser" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="登录名">
          <a-input v-model:value="loginUser.loginName" />
        </a-form-item>
        <a-form-item label="密码">
          <a-input v-model:value="loginUser.password" type="password" />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-layout-header>
</template>

<script lang="ts">
import {defineComponent, ref,computed} from 'vue';
import axios from 'axios'
import { message } from 'ant-design-vue'
import store from "@/store";


export default defineComponent({
  name: 'the-header',
  setup() {
    //登录后保存
    const user = computed(() => store.state.user)


    //用来登录
    const loginUser = ref({
      loginName: "test",
      password: "123456abc"
    })

    const loginModalVisible = ref(false)
    const loginModalLoading = ref(false)
    const showLoginModal = () => {
      loginModalVisible.value = true
    }

    /* 登录 */
    const login = () => {
      console.log("Start login")
      console.log(user)
      loginModalLoading.value = true

      axios.post('/user/login',loginUser.value).then((response) =>{
        loginModalLoading.value = false
        const data = response.data
        if(data.code === 200){
          loginModalVisible.value = false
          message.success("Login successful！")
          store.commit("setUser",data.data)
          /* console.log(data) */
          /*console.log(user.value) */
        }else{
          message.error(data.message)
        }
      })
    }

    //退出登录
    const logout = () => {
      console.log("退出登录开始");
      axios.get('/user/logout/' + user.value.token).then((response) => {
        const data = response.data;
        if (data.code === 200) {
          message.success("退出登录成功！");
          store.commit("setUser", {});
        } else {
          message.error(data.message);
        }
      });
    };


    return {
      loginModalVisible,
      loginModalLoading,
      showLoginModal,
      loginUser,
      login,
      user,
      logout
    }
  }
});


</script>

<style>
.logo {
  width: 120px;
  height: 31px;
  /*margin: 16px 28px 16px 0;*/
  float: left;
  color: white;
  font-size: 18px;
}

.header{
  position:relative;
}

.login-menu{
  color:white;
  position: absolute;
  padding-right:10px;
  right:100px;

}
.logout-menu{
  color:white;
  position: absolute;
  padding-right:10px;
  right:20px;
}





</style>
