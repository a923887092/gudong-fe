<template>
  <div class="plant">
    <mt-header v-if="!isInWX" class="plant-header" fixed>
      <mt-button slot='left' icon='back' @click="handleBack"><strong>认种</strong></mt-button>
    </mt-header>
    <div>
      <img :class="isInWX ? 'plant-title in-wx' : 'plant-title'" :src="plantData.plantInfoPic"/>
      <div class="plant-introduce">
        <img src="../../assets/icon_introduce.png"/>
        <span>认种介绍</span>
      </div>
      <div class="plant-content">
        <ellipsis-plus
          ref="noButton"
          :text="plantData.plantInfo || ''"
          :line="3"
        >
        </ellipsis-plus>
      </div>
      <img class="plant-divider" src="../../assets/img_detail_separatorcolumn.png"/>
      <div class="plant-introduce">
        <img src="../../assets/icon_people.png"/>
        <span>认种人列表</span>
      </div>
      <div class="farm-tab-nodata" v-show="!userList || userList.length === 0">
        <img src="@/assets/img_logo_nodata.png"/>
        <span>农场还没有人员认种，快来加入我们吧～</span>
      </div>
      <ul>
        <li v-for="(item) in userList" :key="item.userNo">
          <div class="plant-people">
            <div class="plant-people-name">
              <img :src="item.headImg" />
              <span>{{ item.userName }}</span>
            </div>
            <span class="plant-people-time">{{ item.plantTime }}</span>
          </div>
        </li>
      </ul>
      <div class="plant-btn">
        <mt-button class="plant-btn-style" type="primary" @click="handlePlant">立即认种</mt-button>
      </div>
    </div>
  </div>
</template>
<script>
import { Header, Button } from 'mint-ui'
import Ellipsis from '../base/ellipsis-plus'
import storage from '@/utils/storage'
import sStorage from '@/utils/sessionStorage'
import apis from '@/components/base/api'
import fetchData from '@/utils/fetch'
export default {
  components: {
    [Ellipsis.name]: Ellipsis,
    [Header.name]: Header,
    [Button.name]: Button
  },
  data () {
    return {
      isInWX: storage.get('isInWX'),
      checked: false,
      userList: [],
      plantData: {},
      plantNo: ''
    }
  },
  mounted () {
    document.title = '认种'
    const vm = this
    const token = sStorage.get('token')
    const params = this.$route.params
    this.plantNo = params.plantNo
    fetchData(apis.plantHis, { accessToken: token, plantNo: params.plantNo, platform: this.isInWX ? '1' : '2' }).then(res => {
      if (res.code === 0) {
        const { plantHis, ...plantData } = res.data
        vm.userList = plantHis
        vm.plantData = plantData
      }
    })
  },
  methods: {
    handlePlant () {
      this.$router.push({ params: { a: 1 }, path: '/infoPlant/' + this.plantNo + '/price/' + this.plantData.plantPrice })
    },
    handleBack () {
      this.$router.go(-1)
    }
  }
}
</script>
<style src="./styles.less" lang="less" scoped></style>
