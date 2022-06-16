<template>
  <div>
    <h1>Welcome to the knowledge base</h1>
    <a-row>
      <a-col :span="24">
        <a-card>
          <a-row>
            <a-col :span="8">
              <a-statistic title="Total reading" :value="statistic.viewCount">
                <template #suffix>
                  <UserOutlined/>
                </template>
              </a-statistic>
            </a-col>
            <a-col :span="8">
              <a-statistic title="Total likes" :value="statistic.voteCount">
                <template #suffix>
                  <like-outlined/>
                </template>
              </a-statistic>
            </a-col>
            <a-col :span="8">
            <!--   precision是数值精度  suffix是数值的后缀     -->
              <a-statistic title="Praise rate" :value="statistic.voteCount / statistic.viweCount * 100"
               :precision="2"
               suffix="%"
               :value-style="{ color:'#cf1322' }"
              >
                <template #suffix>
                  <like-outlined/>
                </template>
              </a-statistic>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </a-row>
    <br>
    <a-row :gutter="16">
      <a-col :span="12">
        <a-card>
          <a-row>
            <a-col :span="12">
              <a-statistic title="Reading today" :value="statistic.todayViewCount" style="margin-right:50px">
                <template #suffix>
                  <UserOutlined/>
                </template>
              </a-statistic>
            </a-col>
            <a-col :span="12">
              <a-statistic title="Like today" :value="statistic.todayVoteCount" >
                <template #suffix>
                  <List-outlined/>
                </template>
              </a-statistic>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card>
          <a-row>
            <a-col :span="12">
              <a-statistic
                  title="Expected reading today"
                  :value="statistic.todayViewIncrease"
                  :value-style="{ color: '#0000ff' }"
              >
                <template #suffix>
                  <UserOutlined />
                </template>
              </a-statistic>
            </a-col>
            <a-col :span="12">
              <a-statistic
                  title="Expected reading growth today"
                  :value="statistic.todayViewIncreaseRateAbs"
                  :precision="2"
                  suffix="%"
                  class="demo-class"
                  :value-style="statistic.todayViewIncreaseRate < 0 ? { color: '#3f8600' } : { color: '#cf1322' }"
              >
                <template #prefix>
                  <arrow-down-outlined v-if="statistic.todayViewIncreaseRate < 0"/>
                  <arrow-up-outlined v-if="statistic.todayViewIncreaseRate >= 0"/>
                </template>
              </a-statistic>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </a-row>
    <br>
    <!--Echarts报表-->
    <a-row>
      <a-col :span="24" id="main-col">
        <div id="main" style="width:100%;height:300px;"></div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, ref} from 'vue';
import axios from 'axios'

/* 因为echatrs是Vue外部的，所以需要全局定义*/
declare let echarts:any


export default defineComponent({
  name: 'the-welcome',
  setup() {
    const statistic = ref()
    statistic.value = {}
    const getStatistic = () => {
      /* get-statistic 是接口返回数组：[昨天，今天] */
      axios.get('/ebook-snapshot/get-30-statistic').then((response) => {
        const data = response.data
        if (data.code === 200) {
          const statisticResp = data.data
          console.log(statisticResp)
          statistic.value.viewCount = statisticResp[29].viewCount
          statistic.value.voteCount = statisticResp[29].voteCount
          statistic.value.todayViewCount = statisticResp[29].todayViewCount
          statistic.value.todayVoteCount = statisticResp[29].todayVoteCount

          /*  按分钟计算当前的时间点，占一天的百分比 */
          const now = new Date()
          /* 预计今日阅读数： 今天预计 = 今天到目前的月的两 / （当前时间点占一天的百分比）
          * now.getHours() * 60 + now.getMinutes() 一天过去多少分钟
          * nowRate 是今天过去百分之几了
          *  */
          const nowRate = (now.getHours() * 60 + now.getMinutes()) / (60 * 24)
          statistic.value.todayViewIncrease = parseInt(String(statisticResp[29].viewIncrease / nowRate))
          statistic.value.todayViewIncreaseRate = (statistic.value.todayViewIncrease - statisticResp[28].viewIncrease) / statisticResp[28].viewIncrease * 100
          statistic.value.todayViewIncreaseRateAbs = Math.abs(statistic.value.todayViewIncreaseRate)
        }
      })
    }

    /* list是后端返回的30天数据 */
    const init30DayEcharts = (list:any) => {
      /* 基于要准备好的dom，初始化echarts实例 */
      const myChart = echarts.init(document.getElementById('main'))

      const xAxis = []
      /* seriesView：横轴 seriesVote：竖轴 */
      const seriesView = []
      const seriesVote = []
      for(let i=0;i < list.length; i++){
        const record = list[i]
        xAxis.push(record.date)
        seriesView.push(record.viewIncrease)
        seriesVote.push(record.voteIncrease)
      }

      /* 指定图表的配置项和数据 */
      const option = {
        title:{
          text:'30天趋势图'
        },
        tooltip:{
          trigger:'axis'
        },
        legend:{
          data:['总阅读量','总点赞量']
        },
        grid:{
          left:'1%',
          right:'3%',
          bottom:'3%',
          containLabel:true
      },
        toolbox:{
          feature:{
            saveAsImage:{}
          }
        },
        xAxis:{
          type:'category',
          boundaryGap:false,
          data:xAxis
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '总阅读量',
            type: 'line',
            // stack: '总量', 不堆叠
            data: seriesView,
            smooth: true
          },
          {
            name: '总点赞量',
            type: 'line',
            // stack: '总量', 不堆叠
            data: seriesVote,
            smooth: true
          }
        ]
      }
          /* 使用刚指定的配置项和数据显示图标 */
          myChart.setOption(option)
    }

    const get30DayStatistic = () => {
      axios.get('/ebook-snapshot/get-30-statistic').then((response) =>{
        const data = response.data
        if(data.code === 200){
          const statisticList = data.data

          init30DayEcharts(statisticList)
        }
      })
    }



    onMounted(()=>{
      getStatistic(),
      get30DayStatistic()
    })
    return{
      statistic
    }
  }
});


</script>


