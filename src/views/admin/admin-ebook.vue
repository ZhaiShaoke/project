<template>
  <a-layout>
    <a-layout-content
        :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }"
    >
      <p>
        <a-button type="primary" @click="add()" size="large">
          新增
        </a-button>
      </p>
      <a-table
          :columns="columns"
          :row-key="record => record.id"
          :data-source="ebooks"
          :pagination="pagination"
          :loading="loading"
          @change="handleTableChange"
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
        title="EBook Form" @ok="handleModalOk">
      <a-form :model="ebook" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="封面">
          <a-input v-model:value="ebook.cover" />
        </a-form-item>
        <a-form-item label="名称">
          <a-input v-model:value="ebook.name" />
        </a-form-item>
        <a-form-item label="分类一">
         <a-input v-model:value="ebook.category1Id"/>
        </a-form-item>
        <a-form-item label="分类二">
          <a-input v-model:value="ebook.category2Id"/>
        </a-form-item>
        <a-form-item label="描述">
          <a-input v-model:value="ebook.description" type="textarea" />
        </a-form-item>
      </a-form>
    </a-modal>

</template>


<script lang="ts">
import { defineComponent ,onMounted,ref} from 'vue';
import axios from 'axios';

const listData:any = [];

export default defineComponent({
  name: 'AdminEbook',
  setup(){
   const ebooks = ref()
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
        title: '分类一',
        key:'category1Id',
        dataIndex:'category1Id'
      },
      {
        title: '分类二',
        key:'category2Id',
        slots: { customRender: 'name' }
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

    /*
    * 数据查询
    * */
    const handleQuery = (params:any) =>{
      loading.value = true
      axios.get("/ebook/list?%E6%95%99%E7%A8%8B",{
        params:{
          page:params.page,
          size:params.size,

        }
      }).then((response) =>{
        loading.value = false
        const data = response.data
        ebooks.value = data.data.list

        /*重置分页按钮*/
        pagination.value.current = params.page
        pagination.value.total = data.data.total
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
    const ebook = ref({})
    const modalVisible = ref(false);
    const modalLoading = ref(false)
    const handleModalOk = ()=>{
      modalLoading.value = true

      axios.post("/ebook/save",ebook.value).then((response) =>{
        const data = response.data /* data = commonResp */
        if(data.code === 200){
          modalVisible.value = false
          modalLoading.value = false
        }

        /*重新加载*/
        handleQuery({
          page:pagination.value.current,
          size:pagination.value.pageSize,

        })
      })
    }

    /*编辑*/
    const edit = (record:any) =>{
      modalVisible.value = true
      ebook.value = record
    }

    /*新增*/
    const add = () =>{
      modalVisible.value = true
      ebook.value = {}
    }

    /*删除*/
    const handleDelete = (id:number)=>{
      axios.delete("/ebook/delete/" + id).then((response) =>{
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

    onMounted(()=>{
        handleQuery({
          page:1,
          size:pagination.value.pageSize,

        })

    });

    return{
      ebooks,
      pagination,
      columns,
      loading,
      handleTableChange,

      edit,
      add,

      ebook,
      modalVisible,
      modalLoading,
      handleModalOk,
      handleDelete
    }


  }
});
</script>