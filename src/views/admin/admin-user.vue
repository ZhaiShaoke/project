<template>
  <a-layout>
    <a-layout-content
        :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }"
    >
      <p>
        <a-form layout="inline" :model="param"
        >
          <a-form-item>
            <a-input v-model:value="param.name" placeholder="名称">
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleQuery({page:1,size:pagination.pageSize})">
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
          :data-source="users"
          :pagination="pagination"
          :loading="loading"
          @change="handleTableChange"
      >
        <template #cover="{ text: cover }">
          <img v-if="cover" :src="cover" alt="avatar" />
        </template>
        <template v-slot:category="{ text, record }">
          <span>{{getCategoryName(record.category1Id)}} / {{getCategoryName(record.category2Id)}}</span>
        </template>
        <template v-slot:action="{ text, record }">
          <a-space size="small">
            <router-link :to="'/admin/doc?userId=' + record.id">
              <a-button type="primary" >
                文档管理
              </a-button>
            </router-link>
            <a-button type="primary" @click="edit(record)">
              重置密码
            </a-button>
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
      title="用户表单"
      v-model:visible="modalVisible"
      :confirm-loading="modalLoading"
      @ok="handleModalOk"
  >
    <a-form :model="user" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <a-form-item label="登陆名">
        <a-input v-model:value="user.loginName" :disabled="!!user.id"/>
      </a-form-item>
      <a-form-item label="昵称">
        <a-input v-model:value="user.name" />
      </a-form-item>
      <a-form-item label="密码" v-show="!user.id">
        <a-input v-model:value="user.password" type="password"/>
      </a-form-item>
    </a-form>
  </a-modal>

  <a-modal
      title="重置密码"
      v-model:visible="resetModalVisible"
      :confirm-loading="resetModalLoading"
      @ok="handleModalOk"
  >
    <a-form :model="user" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <a-form-item label="新密码">
        <a-input v-model:value="user.password"/>
      </a-form-item>
    </a-form>
  </a-modal>

  <a-modal
      title="重置密码"
      v-model:visible="resetModalVisible"
      :confirm-loading="resetModalLoading"
      @ok="handleResetModalOk"
  >
    <a-form :model="user" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <a-form-item label="新密码">
        <a-input v-model:value="user.password" type="password"/>
      </a-form-item>
    </a-form>
  </a-modal>

</template>


<script lang="ts">
import { defineComponent ,onMounted,ref} from 'vue';
import axios from 'axios';
import {message} from 'ant-design-vue'
import {Tool} from "../../../util/tool";

declare let hexMd5: any;
declare let KEY:any;

export default defineComponent({
  name: 'AdminUser',
  setup(){
    const param = ref()
    param.value = {}
    const users = ref()
    const pagination = ref({
      current:1,
      pageSize:4,
      total:0
    })

  const loading = ref(false)

    const columns = [
      {
        title: '封面',
        dataIndex: 'cover',
        slots: { customRender: 'cover' }
      },
      {
        title: '名称',
        dataIndex: 'name'
      },
      {
        title: '分类',
        slots: {customRender:'category'}
      },
      {
        title: '文档数',
        dataIndex: 'docCount'
      },
      {
        title: '阅读数',
        dataIndex: 'viewCount'
      },
      {
        title: '点赞数',
        dataIndex: 'voteCount'
      },
      {
        title: 'Action',
        key: 'action',
        slots: { customRender: 'action' }
      }
    ]

    /*数据查询 */
    const handleQuery = (params:any) =>{
      loading.value = true
      /*如果不清理现有我数据，编辑保存重新加载数据后，再点编辑，则列表显示的还是编辑前的数据*/
      users.value = []
      axios.get("/user/list?%E6%95%99%E7%A8%8B",{
        params:{
          page:params.page,
          size:params.size,
          name:param.value.name
        }
      }).then((response) =>{
        loading.value = false
        const data = response.data
        /*如果成功的话就出现提示*/
        if(data.code === 200){
          users.value = data.data.list
          /*重置分页按钮*/
          pagination.value.current = params.page
          pagination.value.total = data.data.total
        }else{
          message.error(data.message)
        }
      })
    }

        /*表格点击页码时触发*/
    const handleTableChange = (pagination:any) =>{
      console.log("看看自带分页的参数都有啥：" + pagination)
      handleQuery({
        page:pagination.current,
        size:pagination.pageSize
      })
    }

    /*表单*/

    /*
    * 数组[100,101]对应：前端开发 / vue
    * */
    const categoryIds = ref()
    const user = ref()
    const modalVisible = ref(false);
    const modalLoading = ref(false)

    const handleModalOk = ()=>{

      modalLoading.value = true

      user.value.password = hexMd5(user.value.password + KEY)

      axios.post("/user/save",user.value).then((response) =>{
        modalLoading.value = false
        const data = response.data /* data = commonResp */
        if(data.code === 200){
          modalVisible.value = false
          /*modalLoading.value = false*/
        /*重新加载*/
        handleQuery({
          page:pagination.value.current,
          size:pagination.value.pageSize,
        })
        }else{
          message.error(data.message)
        }
      })
    }

    /*编辑*/
    const edit = (record:any) =>{
      modalVisible.value = true
      user.value = Tool.copy(record)
    }



    /*新增*/
    const add = () =>{
      modalVisible.value = true
      user.value = {}
    }

    /*删除*/
    const handleDelete = (id:number)=>{
      axios.delete("/user/delete/" + id).then((response) =>{
        const data = response.data /* data = commonResp */
        if(data.code === 200) {
          /*重新加载*/
          handleQuery({
            page: pagination.value.current,
            size: pagination.value.pageSize,
          })
        }
      })
    };

    const level1 = ref() /*一级分类树，children属性是二级分类*/
    let categorys: any;


    const getCategoryName = (cid : number) =>{
      /* console.log(cid)*/
      let result = ""
      categorys.forEach((item :any) =>{
        if(item.id === cid){
          /*return item.name  注意，这里直接return不起作用*/
          result = item.name
        }
      })
      return result
    }

    /*重置密码*/

    /*
    * 数组[100,101]对应：前端开发 / vue
    * */
    const resetModalVisible = ref(false);
    const resetModalLoading = ref(false)

    const handleResetModalOk = ()=>{

      resetModalLoading.value = true

      user.value.password = hexMd5(user.value.password + KEY)

      axios.post("/user/reset-password",user.value).then((response) =>{
        resetModalLoading.value = false
        const data = response.data /* data = commonResp */
        if(data.code === 200){
          resetModalVisible.value = false
          /*modalLoading.value = false*/
          /*重新加载*/
          handleQuery({
            page:pagination.value.current,
            size:pagination.value.pageSize,
          })
        }else{
          message.error(data.message)
        }
      })
    }

    /*重置密码*/
    const resetPassword = (record:any) =>{
      modalVisible.value = true
      user.value = Tool.copy(record)
      user.value.password = null
    }


    onMounted(()=>{
      handleQuery({
        page:1,
        size:pagination.value.pageSize
      })

    });

    return{
      param,
      users,
      pagination,
      columns,
      loading,
      handleTableChange,
      handleQuery,
      getCategoryName,

      edit,
      add,

      user,
      modalVisible,
      modalLoading,
      handleModalOk,

      resetModalVisible,
      resetModalLoading,
      handleResetModalOk,

      categoryIds,
      level1,

      handleDelete
    }


  }
});
</script>