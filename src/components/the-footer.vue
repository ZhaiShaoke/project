<template>
  <a-layout-footer style="text-align: center">
    Electronic book
<!--    <span v-show="user.id">欢迎：{{user.loginName}}</span>-->
  </a-layout-footer>
</template>

<script lang="ts">
  import {computed, defineComponent,onMounted} from 'vue';
  import store from "@/store";
  import {Tool} from "../../util/tool";

  export default defineComponent({
    name: 'the-footer',
    setup(){
      const user = computed(() =>store.state.user)

     /*  websocket:点赞成功时会通知用户，会在显示的时候和服务器连接，是实时的，缺点是会一直占用服务器
      let websocket:any
      let token:any
      const onOpen = () => {
        console.log('WebSocket连接成功，状态码：',websocket.readyState)
      }

      const onMessage = (event:any) => {
        console.log('WebSocket收到消息：',event.data)
      }

      const onError = () => {
        console.log('WebSocket连接关闭，状态码：',websocket.readyState)
      }

      const onClose = () => {
        console.log('WebSocket连接关闭，状态码：',websocket.readyState)
      }

       初始化的时候，给这四个方法赋值
      const initWebSocket = () => {
         连接成功
        websocket.opopen = onOpen
         收到消息的回调
        websocket.onmessage = onMessage
         连接错误
        websocket.onerror = onError
         连接关闭的回调
        websocket.onclose = onClose
      }

      onMounted(()=>{
         websocket
        if('WebSocket' in window){
          token = Tool.uuid(10)
           连接地址：ws://api.stelpolvo.com/ws/xxx
          websocket = new WebSocket(process.env.VUE_APP_WS_SERVER + '/ws/' + token)
          initWebSocket()
        }else{
          alert('当前浏览器不支持')
        }
      })
*/



      return{
         user,

      }
  }

});
</script>
