<template>
  <a-layout-content
      :style="{background:'#fff',padding:'24px',margin:0,minHeitht:'280px'}"
  >
    <h3 v-if="level1.length === 0">对不起，找不到该文档！</h3>
    <a-row>
      <a-col :span="6">
        <a-tree
            v-if="level1.length > 0"
            :tree-data="level1"
            @select="onSelect"
            :replaceFields="{title: 'name', key: 'id', value: 'id'}"
            :defaultExpandAll="true"
            :defaultSelectedKeys="defaultSelectedKey"
        >
        </a-tree>
      </a-col>
      <a-col :span="18">
        <div  class = "wangeditor" :innerHTML="html"></div>
      </a-col>
    </a-row>

  </a-layout-content>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, createVNode } from 'vue';
import axios from 'axios';
import {message} from 'ant-design-vue';
import {Tool} from "../../util/tool";

import {useRoute} from "vue-router";

export default defineComponent({
  name: 'Doc',
  setup() {
    const route = useRoute();
    const docs = ref();
    const html = ref()
    const defaultSelectedKeys =ref()
    defaultSelectedKeys.value = []
    /**
     * 一级文档树，children属性就是二级文档
     * [{
     *   id: "",
     *   name: "",
     *   children: [{
     *     id: "",
     *     name: "",
     *   }]
     * }]
     */
    const level1 = ref(); // 一级文档树，children属性就是二级文档
    level1.value = [];

    /*内容查询 */
    const handleQueryContent = (id:number) =>{
      axios.get("/doc/find-content?%E6%95%99%E7%A8%8B" + id).then((response) =>{
        const data = response.data
        /*如果成功的话就出现提示*/
        if(data.code === 200){
          html.value = data.data
        }else{
          message.error(data.message)
        }
      })
    }
    /**
     * 数据查询
     **/
    const handleQuery = () => {
      axios.get("/doc/all?%E6%95%99%E7%A8%8B" + route.query.ebookId).then((response) => {
        const data = response.data;
        if (data.code === 200) {
          docs.value = data.data;

          level1.value = [];
          level1.value = Tool.array2Tree(docs.value, 0);

          if(Tool.isNotEmpty(level1)){
            defaultSelectedKeys.value = [level1.value[0].id]
            handleQueryContent(level1.value[0].id)
          }
        } else {
          message.error(data.message);
        }
      });
    };



    const onSelect = (selectedKeys:any , info: any) =>{
      console.log('selected',selectedKeys,info)
      /* selectedKeys 是当前选中的，它是一个数组 */
      if(Tool.isNotEmpty(selectedKeys)){
        /* 加载内容 */
        handleQueryContent(selectedKeys[0])
      }
    }

    onMounted(() => {
      handleQuery();
    });

    return {
      level1,
      html,
      onSelect,
      defaultSelectedKeys
    }
  }
});
</script>

<style>
  /* 参照 wangeditor 文档，地址：https://www.wangeditor.com/doc/pages/02-%E5%86%85%E5%AE%B9%E5%A4%84%E7%90%86/03-%E8%8E%B7%E5%8F%96html.html */
  /* 要在前面加上类的名字，保证自己加的不会影响整个页面 */
  /* table 样式 */
  .wangeditor table {
    border-top: 1px solid #ccc;
    border-left: 1px solid #ccc;
  }
  .wangeditor table td,
  .wangeditor table th {
    border-bottom: 1px solid #ccc;
    border-right: 1px solid #ccc;
    padding: 3px 5px;
  }
  .wangeditor table th {
    border-bottom: 2px solid #ccc;
    text-align: center;
  }

  /* blockquote 样式 */
  .wangeditor blockquote {
    display: block;
    border-left: 8px solid #d0e5f2;
    padding: 5px 10px;
    margin: 10px 0;
    line-height: 1.4;
    font-size: 100%;
    background-color: #f1f1f1;
  }

  /* code 样式 */
  .wangeditor code {
    display: inline-block;
    *display: inline;
    *zoom: 1;
    background-color: #f1f1f1;
    border-radius: 3px;
    padding: 3px 5px;
    margin: 0 3px;
  }
  .wangeditor pre code {
    display: block;
  }

  /* ul ol 样式 */
  .wangeditor ul, ol {
    margin: 10px 0 10px 20px;
  }

  /* 和ant design vue 中的p标签的样式冲突了，需要覆盖掉 */
  .wangeditor blockquote p {
    font-family: 'YouYuan';
    margin: 20px 10px !important;
    font-size: 16px !important;
    font-weight: 600 ;

  }
</style>