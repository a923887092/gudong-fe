<template>
  <div class="pc">
    <mt-navbar class="pc-navbar" v-model="selected">
      <mt-tab-item id="1">认种中</mt-tab-item>
      <mt-tab-item id="2">已结束</mt-tab-item>
    </mt-navbar>
      <mt-tab-container class="pc-tab" v-model="selected">
        <mt-tab-container-item class="pc-tab-item" id="1">
          <ul>
            <li v-for="(item) in dataList" :key="item.farmNo">
              <div class="pc-tab-item-time">
                <img src="@/assets/icon_time.png"/>
                <span>认种时间：{{ item.startTime }}</span>
                <span>至</span>
                <span>{{ item.startTime }}</span>
              </div>
              <img class="pc-tab-item-img" src="../../assets/logo.png"/>
              <div class="pc-tab-item-title">
                <span>{{ item.farmName }}</span>
                <img :src="item.status + '' === '1' ? require('../../assets/img_label1.png') : require('../../assets/img_label2.png')" />
              </div>
              <div class="pc-tab-item-des">
                <img src="../../assets/icon_address.png"/>
                <span>{{ item.farmCity }}</span>
                <img src="../../assets/icon_money.png"/>
                <span>认种金额：{{ salePrice }}元</span>
                <img src="../../assets/icon_number.png"/>
                <span>认种数量：1</span>
              </div>
            </li>
          </ul>
        </mt-tab-container-item>
        <mt-tab-container-item class="pc-tab-item" id="2">
          <ul>
            <li v-for="(item) in dataList" :key="item.farmNo">
              <div class="pc-tab-item-time">
                <img src="@/assets/icon_time.png"/>
                <span>认种时间：{{ item.startTime }}</span>
                <span>至</span>
                <span>{{ item.startTime }}</span>
              </div>
              <img class="pc-tab-item-img" src="../../assets/logo.png"/>
              <div class="pc-tab-item-title">
                <span>{{ item.farmName }}</span>
                <img :src="item.status + '' === '1' ? require('../../assets/img_label1.png') : require('../../assets/img_label2.png')" />
              </div>
              <div class="pc-tab-item-des">
                <img src="../../assets/icon_address.png"/>
                <span>{{ item.farmCity }}</span>
                <img src="../../assets/icon_money.png"/>
                <span>认种金额：{{ salePrice }}元</span>
                <img src="../../assets/icon_number.png"/>
                <span>认种数量：1</span>
              </div>
            </li>
          </ul>
        </mt-tab-container-item>
      </mt-tab-container>
  </div>
</template>
<script>
import { Navbar, TabItem, TabContainer, TabContainerItem } from 'mint-ui'
import fetchData from '@/utils/fetch'
import apis from '@/components/base/api'
import sStorage from '@/utils/sessionStorage'
import storage from '@/utils/storage'
const wx = require('weixin-js-sdk')

export default {
  data () {
    return {
      isInWX: storage.get('isInWX'),
      selected: '1',
      dataList: []
    }
  },
  components: {
    [Navbar.name]: Navbar,
    [TabItem.name]: TabItem,
    [TabContainer.name]: TabContainer,
    [TabContainerItem.name]: TabContainerItem
  },
  mounted () {
    this.getDataList('0')
    if (this.isInWX) {
      this.$getJsConfig(location.href.split('#')[0], [], function () {
        wx.hideAllNonBaseMenuItem()
      })
    }
  },
  methods: {
    getDataList (status) {
      const token = sStorage.get('token')
      const vm = this
      fetchData(apis.myPlant, { status, accessToken: token, platform: this.isInWX ? '1' : '2' }).then(res => {
        if (res.code === 0) {
          vm.dataList = res.data.result
        }
      })
    }
  },
  watch: {
    selected: function (val) {
      if (val === '1') {
        this.getDataList('0')
      } else {
        this.getDataList('1')
      }
    }
  }
}
</script>
<style src="./styles.less" lang="less" scoped></style>
