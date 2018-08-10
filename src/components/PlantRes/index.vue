<template>
  <div class="plant-res">
    <mt-header v-if="!isInWX" class="plant-res-header" fixed>
      <mt-button slot='left' icon='back'><strong>认种结果</strong></mt-button>
    </mt-header>
    <div class="plant-res-content">
      <img :src="result ? require('@/assets/img_success.png') :require('@/assets/img_fail.png') " />
      <span class="plant-res-content-text">恭喜您，成功认种一棵水蜜桃树！</span>
    </div>
    <div class="plant-res-btn">
      <mt-button class="plant-res-btn-style" type="primary" @click="handlePlant">关注公众号</mt-button>
      <mt-button class="plant-res-btn-style-1" plain type="primary" @click="handleToShop">去商城逛逛</mt-button>
      <mt-button class="plant-res-btn-style-2" plain type="default" @click="handleBackHome">返回首页</mt-button>
    </div>
  </div>
</template>
<script>
import { Header, Button } from 'mint-ui'
import storage from '@/utils/storage'

export default {
  components: {
    [Header.name]: Header,
    [Button.name]: Button
  },
  data () {
    return {
      isInWX: storage.get('isInWX'),
      result: true
    }
  },
  mounted () {
    document.title = '认种结果'
  }
}
</script>
<style src="./styles.less" lang="less" scoped>
</style>
