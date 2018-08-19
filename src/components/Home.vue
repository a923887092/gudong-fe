<template>
  <div class="home">
    <div v-show="loading" class="home-loading">
      <mt-spinner :type="2" color="#26a2ff"></mt-spinner>
    </div>
    <mt-header v-if="!isInWX" class="home-header" fixed>
      <mt-button slot='left' icon='back'><strong>种植基地</strong></mt-button>
    </mt-header>
    <swiper v-show="banners && banners.length > 0" :class="isInWX ? 'home-swipe in-wx' : 'home-swipe'" :options="swiperOption">
      <swiper-slide class="swiper-slide" v-for="(item, index) in banners" :key="index">
        <img @click="bannerClick(item.targetUrl)" style="width: 100%; height: 100%;" :alt="item.bannerTitle" :src="item.bannerPicUrl"/>
      </swiper-slide>
      <!-- <swiper-slide class="swiper-slide"><img style="width: 100%; height: 100%;" src="https://ss0.baidu.com/94o3dSag_xI4khGko9WTAnF6hhy/image/h%3D300/sign=4a51c9cd7e8b4710d12ffbccf3ccc3b2/b64543a98226cffceee78e5eb5014a90f703ea09.jpg"/></swiper-slide>
      <swiper-slide class="swiper-slide"><img style="width: 100%; height: 100%;" src="https://ss0.baidu.com/94o3dSag_xI4khGko9WTAnF6hhy/image/h%3D300/sign=4a51c9cd7e8b4710d12ffbccf3ccc3b2/b64543a98226cffceee78e5eb5014a90f703ea09.jpg"/></swiper-slide> -->
      <!-- <div class="swiper-pagination" slot="pagination"></div> -->
    </swiper>
    <ul v-show="farms && farms.length > 0" class="home-list">
      <li v-for="(item ,index) in farms" :key="index" @click="goLiveDetail(item)">
        <div class="list-item-img">
          <img v-show="!!item.isRecommand" class="list-item-tag" src="../assets/img_label_recommend.png"/>
          <img v-lazy.container="item.farmImg" style="width: 100%; height: 100%;" />
          <div v-show="item.videos" class="list-item-img-people">
            <div class="liip-img">
              <img :style="'left: ' + ii * 14 + 'px; z-index: ' + (10 - i)" v-for="(i, ii) in item.headImgs" :src="i" :key="ii"/>
            </div>
            <div class="liip-text">{{ videosNum(item.videos) + ' 观看' }}</div>
          </div>
        </div>
        <div class="list-item-title-container">
          <span class="list-item-title">{{ item.farmName }}</span>
          <span :class="item.videoStatus + '' === '1' ? 'list-item-living' : 'list-item-living error'">
            <img :src="item.videoStatus + '' === '1' ? require('@/assets/living.gif') : require('@/assets/icon_abnormal.png')"/>
            {{ item.videoStatus + '' === '1' ? '直播中' : '直播异常' }}
          </span>
        </div>
        <div class="list-item-info">
          <div class="list-item-info-cell"><img class="list-item-info-icon" src="../assets/icon_address.png" />{{ item.farmCity }}</div>
          <div class="list-item-info-cell"><img class="list-item-info-icon" src="../assets/icon_comment.png"/><span>{{ item.message + '个槽点' }}</span></div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { Header, Button, Swipe, SwipeItem, Lazyload, Spinner } from 'mint-ui'
import { swiper, swiperSlide } from 'vue-awesome-swiper'
import Vue from 'vue'
import storage from '@/utils/storage'
import sStorage from '@/utils/sessionStorage'
import 'swiper/dist/css/swiper.css'
import fetchData from '@/utils/fetch'
import paramsUtils from '@/utils/params'
import apis from '@/components/base/api'
const wx = require('weixin-js-sdk')

Vue.use(Lazyload)

export default {
  name: 'Home',
  created () {
  },
  data: function () {
    return {
      loading: false,
      isInWX: storage.get('isInWX'),
      wxIsReady: false,
      banners: [],
      farms: [],
      share: {},
      swiperOption: {
        slidesPerView: 'auto',
        centeredSlides: true,
        spaceBetween: 5,
        loop: false,
        pagination: {
          el: '.swiper-pagination',
          bulletActiveClass: 'my-bullet-active',
          bulletClass: 'my-bullet',
          clickable: true
        }
      }
    }
  },
  components: {
    [Header.name]: Header,
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem,
    [Button.name]: Button,
    [Spinner.name]: Spinner,
    swiper,
    swiperSlide
  },
  mounted () {
    const params = { platform: '2' }
    const { code } = paramsUtils.url2json(location)
    if (this.isInWX) {
      params.code = code
      params.platform = '1'
    }
    params.code = code
    document.title = '种植基地'
    if (sStorage.get('token')) {
      this.initComp(sStorage.get('token'))
    } else {
      fetchData('/api/gateway/auth/getToken', params).then(res => {
        const token = res.data.accessToken
        sStorage.set('token', token)
        this.initComp(token)
      })
    }
  },
  methods: {
    initComp (token) {
      const vm = this
      fetchData(apis.home, { accessToken: token, platform: this.isInWX ? '1' : '2' }).then(res => {
        if (res.code === 0) {
          vm.banners = res.data.banners
          vm.farms = res.data.farms
          if (this.isInWX) {
            const title = '只要' + res.data.share.price + '元，就能成为谷咚的农场主 ~ '
            // const link = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx650e30e3ec9bfd40&redirect_uri=http%3a%2f%2fmall.91ncp.com.cn&response_type=code&scope=snsapi_userinfo&state=#wechat_redirect'
            this.$getJsConfig(location.href.split('#')[0], [], function () {
              vm.wxIsReady = true
              wx.hideAllNonBaseMenuItem()
              wx.showMenuItems(
                {
                  menuList: [
                    'menuItem:share:appMessage',
                    'menuItem:share:timeline',
                    'menuItem:share:qq'
                  ]
                }
              )
              const nickName = res.data.share.nickName
              wx.onMenuShareTimeline({
                title,
                link: 'http://mall.91ncp.com.cn/?isShare=1#/',
                imgUrl: 'http://img.zcool.cn/community/0117e2571b8b246ac72538120dd8a4.jpg@1280w_1l_2o_100sh.jpg',
                success: function () {}
              })
              wx.onMenuShareAppMessage({
                title,
                desc: '您的好友' + nickName + '邀您一起来看看吧 ~',
                link: 'http://mall.91ncp.com.cn/?isShare=1#/',
                imgUrl: 'http://img.zcool.cn/community/0117e2571b8b246ac72538120dd8a4.jpg@1280w_1l_2o_100sh.jpg',
                type: '',
                dataUrl: '',
                success: function () {
                }
              })
              wx.onMenuShareQQ({
                title,
                desc: '您的好友' + nickName + '邀您一起来看看吧 ~',
                link: 'http://mall.91ncp.com.cn/?#/',
                imgUrl: 'http://img.zcool.cn/community/0117e2571b8b246ac72538120dd8a4.jpg@1280w_1l_2o_100sh.jpg',
                success: function () {
                }
              })
            }, function (res) {})
          }
        }
      })
    },
    wxShare (title, link, nickName) {
    },
    goLiveDetail: function (item) {
      this.$router.push({ path: '/live/' + item.farmNo + '/detail/' + item.farmName })
    },
    bannerClick (targetUrl) {
      location.href = targetUrl
    },
    videosNum (videos) {
      if (videos > 999) {
        return Math.floor(videos / 1000) + 'k'
      }
      return videos
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.home-loading {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #FFFFFF;
  z-index: 10;
}
.home-header {
  background: #FFFFFF;
  color: #000000;
}
.home-swipe {
  width: 100%;
  height: 150px;
  margin-top: 40px;
}
.home-swipe.in-wx {
  margin-top: 0;
}
.swiper-slide {
  width: 345px;
  // background-color: #57a2e7;
}
.home-list {
  margin: 25px 0 35px;
}
.home-list li {
  margin-top: 25px;
}
.list-item-img {
  width: 100%;
  height: 135px;
  overflow: hidden;
  position: relative;
}
.list-item-img .list-item-img-people {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 31px;
  width: 276px;
  background: rgba(0,0,0,0.4);
  border-top-right-radius: 15px;
  border-bottom-right-radius: 15px;
  padding: 0 15px;
  display: flex;
  align-items: center;
  justify-content: space-between
}
.list-item-img .list-item-img-people .liip-img {
  height: 18px;
  display: flex;
  align-items: center;
  position: relative;
}
.list-item-img .list-item-img-people .liip-text {
  font-size: 12px;
  font-family: PingFangSC-Regular;
  color: rgba(255,255,255,1);
}
.list-item-img .list-item-img-people .liip-img img {
  width: 18px;
  height: 18px;
  border-radius: 9px;
  position: absolute;
}
.list-item-tag {
  position: absolute;
  left: 0;
  top: 10px;
  width: 56px;
  height: 20px;
}
.list-item-title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 40px;
  padding: 0 15px;
}
.list-item-title {
  font-size: 16px;
  font-weight: bold;
  font-family: PingFangSC-Medium, sans-serif;
  color: rgba(48,48,48,1);
}
.list-item-living {
  font-family: PingFangSC-Regular, sans-serif;
  font-size: 12px;
  color: rgba(20,186,114,1);
  display: flex;
}
.list-item-living img {
  width: 14px;
  height: 14px;
  margin-right: 3px;
}
.list-item-living.error {
  color: rgba(255,62,62,1);
  align-items: center;
}
.list-item-info {
  min-height: 20px;
  padding-left: 15px;
  display: flex;
  align-items: center;
}
.list-item-info-cell {
  min-height: 20px;
  display: flex;
  align-items: center;
  font-size: 12px;
  font-family: PingFangSC-Regular;
  color: rgba(153,153,153,1);
  img {
    margin-right: 6px;
  }
}
.list-item-info-cell:nth-child(1) {
  margin-right: 44px;
}

.list-item-info-icon {
  height: 14px;
  width: 15px;
}
</style>
