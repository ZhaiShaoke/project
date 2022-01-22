<template>
  <a-layout>
    <a-layout-content
        :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }"
    >
      <p>
        <a-form layout="inline" :model="param"
        >
          <a-form-item>
            <a-button type="primary" @click="handleQuery()">
              查询
            </a-button>
          </a-form-item>
          <a-form-item>
             <a-button type="primary" @click="add()">
                新增
             </a-button>
          </a-form-item>
        </a-form>
      </p>
      <a-table
          :columns="columns"
          :row-key="record => record.id"
          :data-source="level1"
          :pagination="false"
          :loading="loading"
      >
        <template #cover="{ text: cover }">
          <img v-if="cover" :src="cover" alt="avatar" />
        </template>
        <template v-slot:action="{ text, record }">
          <a-space size="small">
            <a-button type="primary" @click="edit(record)">
              编辑
            </a-button>
            <a-popconfirm
                title="Are you sure you want to delete it? It cannot be restored after deletion."
                ok-text="Yes"
                cancel-text="No"
                @confirm="handleDelete(record.id)"
            >
              <a-button type="danger">
                删除
              </a-button>
            </a-popconfirm>

          </a-space>
        </template>
      </a-table>
    </a-layout-content>
  </a-layout>


    <a-modal
        v-model:visible="modalVisible"
        :contrim-loading="modalLoading"
        title="Document form" @ok="handleModalOk">
      <a-form :model="doc" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="名称">
          <a-input v-model:value="doc.name" />
        </a-form-item>
        <a-form-item label="父文档">
          <a-tree-select
              v-model:value="doc.parent"
              style="width:100%"
              :dropdown-style="{maxHeight:'400px',overflow:'auto'}"
              :tree-data="treeSelectData"
              placeholder="Please select"
              tree-default-expand-all
              :replaceFileds="{title:'name',key:'id',value:'id'}"
          >

          </a-tree-select>
        </a-form-item>
        <a-form-item label="顺序">
          <a-input v-model:value="doc.sort"/>
        </a-form-item>
        <a-form-item label="内容">
          <div id="content"></div>
        </a-form-item>
      </a-form>
    </a-modal>

</template>


<script lang="ts">
import {createVNode, defineComponent, onMounted, ref} from 'vue';
import axios from 'axios';
import {message, Modal} from 'ant-design-vue'
import {Tool} from "../../../util/tool";
import {useRoute} from "vue-router";
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import E from "wangeditor"


export default defineComponent({
  name: 'AdminDoc',
  setup(){
    const route = useRoute()
    /* console.log("路由",route) */
    /* console.log("route.path",route.path) */
    console.log("route.query",route.query)
    /* console.log("route.params",route.params) /*
    /* console.log("route.fullPath",route.fullPath) */
    /* console.log("route.name",route.name) */
    /* console.log("route.meta",route.meta) */
    const param = ref()
    param.value = {}
    const docs = ref()


    const loading = ref(false)

    const columns = [
      {
        title: '名称',
        dataIndex: 'name'
      },
      {
        title: '父分类',
        key:'parent',
        dataIndex:'parent'
      },
      {
        title: '顺序',
        dataIndex: 'sort'
      },
      {
        title: 'Action',
        key: 'action',
        slots: { customRender: 'action' }
      }
    ]

    /**
     * 一级分类树，children属性就是二级分类
     * [{
     *   id: "",
     *   name: "",
     *   children: [{
     *     id: "",
     *     name: "",
     *   }]
     * }]
     */
    const level1 = ref() /*一级分类树，children属性是二级分类*/

    /*数据查询 */
    const handleQuery = () =>{
      loading.value = true
      level1.value = []
      axios.get("/doc/all?%E6%95%99%E7%A8%8B").then((response) =>{
        loading.value = false
        const data = response.data
        /*如果成功的话就出现提示*/
        if(data.code === 200){
          level1.value = []
          level1.value = Tool.array2Tree(docs.value,0)
          console.log("树形结构：",level1)
          docs.value = data.data
        }else{
          message.error(data.message)
        }
      })
    }


    /*表单*/
    /*因为树选择组件的属性状态，会随着当前编辑的节点而变化，所以单独声明一个响应式变量*/
    const treeSelectData = ref()
    treeSelectData.value = []
    const doc = ref({})
    const modalVisible = ref(false);
    const modalLoading = ref(false)
    /* 创建富文本 */
    const editor = new E("#content")


    const handleModalOk = ()=>{
      modalLoading.value = true
      axios.post("/doc/save",doc.value).then((response) =>{
        modalLoading.value = false
        const data = response.data /* data = commonResp */
        if(data.code === 200){
          modalVisible.value = false
          /*modalLoading.value = false*/
        /*重新加载*/
        handleQuery()
        }else{
          message.error(data.message)
        }
      })
    }

    /*将某节点及其子孙节点全部设置为disabled*/
    const setDisable = (treeSelectData : any, id:any) =>{
      console.log("-------" + treeSelectData,id)
      /*遍历数组，及遍历某一层节点*/
      for(let i = 0; i < treeSelectData.length; i++){
        const node = treeSelectData[i]
        if(node.id === id){
          /* 如果当前节点就是目标节点 */
          console.log("disabled" , node)
          /* 将目标节点设置为disabled */
          node.disabled = true

          /* 遍历所有子节点，将所有子节点全部都加上disabled */
          const children = node.children
          if(Tool.isNotEmpty(children)) {
            for(let j = 0; j < children.length; j++){
              setDisable(children,children[j].id)
            }
          }
        }else{
          /* 如果当前节点不是目标节点，则到其子节点再找找看 */
          const children = node.children
          if(Tool.isNotEmpty(children)){
            setDisable(children, id)
          }
        }
      }
    }
    /*编辑*/
    const edit = (record:any) =>{
      modalVisible.value = true
      doc.value = Tool.copy(record)

      /*不能选择当前节点及其所有子孙节点，作为父节点，会使树断开*/
      treeSelectData.value = Tool.copy(level1.value)
      setDisable(treeSelectData.value,record.id)

      /*为选择树添加一个‘无’*/
      treeSelectData.value.unshift({id:'0',value:'none'})

      setTimeout(()=>{
        editor.create()
      })
    }

    /*新增*/
    const add = () =>{
      modalVisible.value = true
      doc.value = {
        ebookId:route.query.ebookId
      }
      treeSelectData.value = Tool.copy(level1.value)
      treeSelectData.value.unshift({id:'0',value:'none'})

      setTimeout(()=>{
        editor.create()
      })

    }
    const deleteIds: Array<string> = []
    const deleteNames: Array<string> = []
    /*将某节点及其子孙节点全部设置为disabled*/
    const getDeleteIds = (treeSelectData : any, id:any) =>{
       /* console.log("-------" + treeSelectData,id) */
      /*遍历数组，及遍历某一层节点*/
      for(let i = 0; i < treeSelectData.length; i++){
        const node = treeSelectData[i]
        if(node.id === id){
          /* 如果当前节点就是目标节点 */
          console.log("delete" , node)
          /* 将目标id放入结果集ids */
          /* node.disabled = true */
          deleteIds.push(id)
          deleteNames.push(node.name)

          /* 遍历所有子节点 */
          const children = node.children
          if(Tool.isNotEmpty(children)) {
            for(let j = 0; j < children.length; j++){
              getDeleteIds(children,children[j].id)
            }
          }
        }else{
          /* 如果当前节点不是目标节点，则到其子节点再找找看 */
          const children = node.children
          if(Tool.isNotEmpty(children)){
            getDeleteIds(children, id)
          }
        }
      }
    }
    /*删除*/
    const handleDelete = (id:number)=>{
      /* console.log("level.value,id") */
      getDeleteIds(level1.value,id)
      /* 清空数组，否则多次删除时，数组会一直增加 */
      deleteNames.length = 0
      deleteIds.length = 0
      /* console.log(ids) */
      Modal.confirm({
        title: 'Important reminder',
        icon: createVNode(ExclamationCircleOutlined),
        content: '将删除：【' + deleteNames.join(',') + '】删除后不可恢复，确定删除？',
        onOk() {
          axios.delete("/doc/delete/" + deleteIds.join(",")).then((response) =>{
            const data = response.data /* data = commonResp */
            if(data.code === 200) {
              /*重新加载*/
              handleQuery()
            } else {
              message.error(data.message)
            }
          })
        },
      });
    };

    onMounted(()=>{
        handleQuery()
    });

    return{
      param,
      /*docs,*/
      level1,
      columns,
      loading,
      handleQuery,
      edit,
      add,

      doc,
      modalVisible,
      modalLoading,
      handleModalOk,
      handleDelete,

      treeSelectData
    }


  }
});
</script>