<template>
  <a-layout>
    <a-layout-sider width="200" style="background: #fff">
      <a-menu
          mode="inline"
          :style="{ height: '100%', borderRight: 0 }"
          @click="handleClick"
         :openKeys="openKeys"
      >
        <a-menu-item key="welcome">
            <MailOutlined />
            <span>欢迎</span>
        </a-menu-item>
        <a-sub-menu v-for="item in level1" :key="item.id" :disabled="false">
        <!--   一级菜单       -->
          <template v-slot:title>
            <span><user-outlined />{{item.name}}</span>
          </template>
          <a-menu-item v-for="child in item.children" :key="child.id">
            <MailOutlined /><span>{{child.name}}</span>
          </a-menu-item>
        </a-sub-menu>
        <a-menu-item key="tip" :disabled="false">
          <span>以上菜单在分类管理配置</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <a-layout-content
        :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }"
    >
      <!-- 欢迎页面 -->
      <div class = "welcome" v-show = "isShowWelcome">
        <h1>Welcome to the knowledge base</h1>
      </div>
      <!--  电子书    -->
      <a-list v-show="!isShowWelcome" item-layout="vertical" size="large" :grid="{gutter:20, columns:3}"
               :data-source="ebooks">
        <template #renderItem="{ item }">
          <a-list-item key="item.name">
<!--            <template #actions>-->
<!--              <span v-for="{ type, text } in actions" :key="type">-->
<!--                <component v-bind:is="type" style="margin-right: 8px" />-->
<!--                {{ text }}-->
<!--              </span>-->
<!--            </template>-->
            <template #actions>
              <span>
                <component v-bind:is="'FileOutlined'" style="margin-right: 8px" />
                {{ item.docCount }}
              </span>
              <span>
                <component v-bind:is="'UserOutlined'" style="margin-right: 8px" />
                {{ item.viewCount }}
              </span>
              <span>
                <component v-bind:is="'LikeOutlined'" style="margin-right: 8px" />
                {{ item.voteCount }}
              </span>
            </template>
            <a-list-item-meta :description="item.description">
              <template #title>
                <router-link :to="'/doc?ebookId=' + item.id">
                  {{item.name}}
                </router-link>
              </template>
              <template #avatar><a-avatar :src="item.cover" /></template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </a-layout-content>
  </a-layout>
</template>

<script lang="ts">
import { defineComponent ,onMounted,ref,reactive,toRef} from 'vue';
import axios from 'axios';
import {message} from "ant-design-vue";
import {Tool} from "../../util/tool";



export default defineComponent({
  name: 'Home',
  components:{

  },
  setup(){
    console.log("setup");
    const ebooks = ref()
    /*const ebooks1 = reactive({books:[]})*/
    const openKeys = ref()

    const level1 =  ref();
    let categorys: any;
    /**
     * 查询所有分类
     **/
    const handleQueryCategory = () => {
      axios.get("/category/all?%E6%95%99%E7%A8%8B").then((response) => {
        const data = response.data;
        if (data.code === 200) {
          categorys = data.data;
          console.log("原始数组：", categorys);

          /* 加载完分类后，将侧边栏全部展开 */
          // openKeys.value = []
          // for(let i = 0; i < categorys.length; i++){
          //   openKeys.value.push(categorys[i].id)
          // }


          level1.value = [];
          level1.value = Tool.array2Tree(categorys, 0);
          console.log("树形结构：", level1.value);
        } else {
          message.error(data.message);
        }
      });
    };



    const isShowWelcome = ref(true)
    let categoryId2 = 0

    const handleClick = (value:any) =>{
      /*console.log("menu click",value)*/

      if(value.key === 'welcome'){
        isShowWelcome.value = true
      }else{
        categoryId2 = value.key
        isShowWelcome.value = false
        handleQueryEbook()
      }

      /*isShowWelcome.value = value.key === 'welcome';*/
    }


    const handleQueryEbook = () =>{
      axios.get( "/ebook/list?%E6%95%99%E7%A8%8B",{
        params:{
          page:1,
          size:1000,
          categoryId2:categoryId2
        }
      }).then((response)=>{
        const data = response.data
        ebooks.value = data.data.list
        /*ebooks1.books = data.data*/
        console.log(response)
      });
    }


    onMounted(()=>{
      handleQueryCategory()
      /*handleQueryEbook()*/

      /*console.log("onMounted")*/
    });

    return{
      ebooks,
      /*ebooks2:toRef(ebooks1,"books"),
      listData,*/
      pagination:{
        onChange: (page: any) => {
          console.log(page);
        },
        pageSize: 3,
      },
      /* actions:[
        { type: 'StarOutlined', text: '156' },
        { type: 'LikeOutlined', text: '156' },
        { type: 'MessageOutlined', text: '2' },
      ], */

      handleClick,
      level1,
      isShowWelcome,

      openKeys,
    }


  }
});
</script>

<style scoped>
.ant-avatar  {
  width: 50px;
  height: 50px;
  line-height: 50px;
  border-radius:8%;
  margin: 5px 0;
  }
</style>
