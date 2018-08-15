<template>
  <div class="plant-res">
    <mt-header v-if="!isInWX" class="plant-res-header" fixed>
      <mt-button slot='left' icon='back'><strong>{{ result ? '认种成功' : '认种失败' }}</strong></mt-button>
    </mt-header>
    <div class="plant-res-content">
      <img :src="result ? require('@/assets/img_success.png') :require('@/assets/img_fail.png') " />
      <span class="plant-res-content-text">{{ result ? '恭喜您，成功认种一棵水蜜桃树！' : '非常抱歉，您已放弃了认种！' }}</span>
    </div>
    <div class="plant-res-btn">
      <mt-button class="plant-res-btn-style" type="primary" @click="handleAttention">关注公众号</mt-button>
      <mt-button class="plant-res-btn-style-1" plain type="primary" @click="handleToShop">去商城逛逛</mt-button>
      <mt-button class="plant-res-btn-style-2" plain type="default" @click="handleBackHome">返回首页</mt-button>
    </div>
  </div>
</template>
<script>
import { Header, Button } from 'mint-ui'
import storage from '@/utils/storage'
const wx = require('weixin-js-sdk')

export default {
  components: {
    [Header.name]: Header,
    [Button.name]: Button
  },
  data () {
    return {
      isInWX: storage.get('isInWX'),
      result: (this.$route.params.code + '') === '1'
    }
  },
  mounted () {
    document.title = this.result ? '认种成功' : '认种失败'
    if (this.result) {
      history.pushState(null, null, location.href)
      window.addEventListener('popstate', this.popstateCallback)
    }
    if (this.isInWX) {
      this.$getJsConfig(location.href.split('#')[0], [], function () {
        wx.hideAllNonBaseMenuItem()
      })
    }
  },
  methods: {
    popstateCallback (event) {
      history.pushState(null, null, location.href)
      window.removeEventListener('popstate', this.popstateCallback)
      location.href = '/#/'
    },
    handleBackHome () {
      location.href = '/#/'
    },
    handleAttention () {
      location.href = 'https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzIzNjc0MTg1OQ==&scene=124#wechat_redirect'
    }
  }
}
</script>
<style src="./styles.less" lang="less" scoped>
</style>
