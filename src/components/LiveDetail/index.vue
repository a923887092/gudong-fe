<template>
  <div class="live-detail">
    <mt-header v-if="!isInWX" class="live-header" fixed>
      <mt-button slot='left' icon='back' @click="goBack"><strong>{{ liveTitle }}</strong></mt-button>
    </mt-header>
    <div :class="isInWX ? 'live-content in-wx' : 'live-content'">
      <video
        preload="auto"
        webkit-playsinline="true"
        x5-video-player-type="h5"
        x5-video-player-fullscreen="true"
        x-webkit-airplay="allow"
        ref="video"
        playsinline
        id="my_video_player"
        class="video-style video-js vjs-default-skin vjs-big-play-centered"
        data-setup='{}'
      >
      </video>
      <div v-show="!!videoDetail" :class="videoDetail.videoStatus + '' === '1' ? 'video-tag' : 'video-tag error'">
        {{ videoDetail.videoStatus + '' === '1' ? '直播中' : '直播异常' }}
      </div>
      <div v-show="videoControlStatus" class="video-controls">
        <div class="video-controls-left">
          <div class="video-controls-left-item"><img src="@/assets/icon_detail_address.png"/><span>{{ videoDetail.farmCity || '' }}</span></div>
          <div class="video-controls-left-item"><img src="@/assets/icon_detail_people.png"/><span>{{ (videoDetail.videos || 0) + '观看' }}</span></div>
        </div>
        <div class="video-controls-right" @click="handleFullscreen">
          <img src="@/assets/button_detail_fullscreen.png" /><span>全屏</span>
        </div>
      </div>
    </div>
    <div class="race-progress-container">
      <mt-progress class="race-progress" :value="Math.ceil(plantInfo.saleCount * 100 / plantInfo.targetCount)" :bar-height="4">
        <div slot="end">{{ Math.ceil(plantInfo.saleCount * 100 / plantInfo.targetCount) + '%' }}</div>
      </mt-progress>
    </div>
    <div class="live-data-content">
      <div class="live-data-item">
        <span class="live-data-item-num">{{ comdify(plantInfo.targetCount) }}</span>
        <span class="live-data-item-des">{{ plantInfo.targetUnit }}</span>
      </div>
      <div class="live-data-item">
        <span class="live-data-item-num">{{ comdify(plantInfo.saleCount) }}</span>
        <span class="live-data-item-des">{{ plantInfo.saleUnit }}</span>
      </div>
      <div class="live-data-item">
        <span class="live-data-item-num">{{ comdify(plantInfo.peopleCount) }}</span>
        <span class="live-data-item-des">{{ plantInfo.peopleUnit }}</span>
      </div>
    </div>
    <div class="live-owner">
      <img class="live-owner-img" :src="plantInfo.farmerPic" />
      <div class="live-owner-data">
        <audio style="display: none" id="audioTag" :src="plantInfo.farmerSound" ></audio>
        <div class="live-owner-data-content">
          <div>
            <span>农户寄语</span>
            <div>
              <mt-progress class="owner-data-progress" :value="audioProgress" :bar-height="3">
              </mt-progress>
            </div>
          </div>
        </div>
        <div class="controls">
          <img @click="changeAudioState" class="play-pause" id="playPause" :src="!audioStatus ? require('@/assets/icon_voice_play.png') : require('@/assets/icon_voice_stop.png') " />
        </div>
      </div>
    </div>
    <div class="live-owner-profile">
      <div class="live-owner-profile-title">农主介绍</div>
      <div class="live-owner-profile-info">{{ plantInfo.farmer }}&nbsp;&nbsp;&nbsp;&nbsp;{{ plantInfo.age + '岁' }}&nbsp;&nbsp;&nbsp;&nbsp;{{ plantInfo.job }}</div>
      <div class="live-owner-profile-content">{{ plantInfo.farmerInfo }}</div>
      <div class="live-owner-profile-title">农户宣语</div>
      <div class="live-owner-profile-content">{{ plantInfo.farmerSay }}</div>
    </div>
    <div class="live-owner-btn">
      <mt-button class="live-owner-btn-style" type="primary" @click="handlePlant">邀你认种</mt-button>
    </div>
    <img v-show="farmInfo.farmGoods && farmInfo.farmGoods.length > 0" class="live-divider" src="../../assets/img_detail_separatorcolumn.png"/>
    <div v-show="farmInfo.farmGoods && farmInfo.farmGoods.length > 0" class="farm-product">
      <span>农场产品</span>
      <ul>
        <li v-for="(item) in farmInfo.farmGoods || []" :key="item.goodsNo">
          <div @click="handleGoProduct(item.mallNo)" class="farm-pro-img"><img :src="item.goodsImg" /></div>
          <div>{{ item.goodsName }}</div>
        </li>
        <!-- <li>
          <div class="farm-pro-img"><img src="../../assets/logo.png" /></div>
          <div>鸡蛋</div>
        </li> -->
      </ul>
    </div>
    <div class="farm-space-divide"></div>
    <div>
      <mt-navbar ref="navbar" :class="navbarFixed ? 'farm-navbar fixed' : 'farm-navbar'" v-model="selected">
        <mt-tab-item id="1">
          <div style="position: relative">
            <span>吐槽区</span>
            <mt-badge v-show="!!newMessages" color="#FF3E3E" size="small" style="position: absolute; top: -9px; right: 9px">{{ newMessages }}</mt-badge>
          </div>
        </mt-tab-item>
        <mt-tab-item id="2">农场说明</mt-tab-item>
        <mt-tab-item id="3">认种人</mt-tab-item>
      </mt-navbar>
      <mt-tab-container class="farm-tab-container" v-model="selected">
        <mt-tab-container-item id="1">
          <div class="farm-tab-nodata" v-show="!message || message.length === 0">
            <img src="@/assets/img_logo_nodata.png"/>
            <span>农场还没有吐槽，快来参加吐槽吧～</span>
          </div>
          <ul class="farm-comment-ul" v-show="message && message.length > 0">
            <li
              class="farm-comment-li"
              v-for="(item) in message"
              :key="item.messageNo"
              style="display: flex; border-bottom: 1px rgba(231,231,231,1) solid"
            >
              <img class="comment-img" :src="item.headImg"/>
              <div style="flex: 1;">
                <div class="comment-title">
                  <span>{{ item.userName || '' }}</span>
                  <span>{{ genMsgTime(item.messageTime) }}</span>
                </div>
                <div class="comment-content">
                  <div class="comment-content-text">
                    <ellipsis-plus
                      ref="noButton"
                      :text="item.message"
                      :line="3"
                    >
                    </ellipsis-plus>
                  </div>
                  <div class="comment-content-img-container">
                    <div class="comment-content-img" v-for="(imgUrl, index) in item.messageUrl" :key="index">
                      <img @click="previewCommentImg(imgUrl, item.messageUrl)" :src="imgUrl" />
                    </div>
                  </div>
                </div>
              </div>
            </li>
            <li>
              <mt-spinner v-show="pageLoading" type="fading-circle"></mt-spinner>
              <span @click="loadMore" v-show="!pageLoading">{{ isAllData ? '已全部加载' : '显示更多...' }}</span>
            </li>
          </ul>
        </mt-tab-container-item>
        <mt-tab-container-item id="2">
          <div class="farm-tab-nodata" v-show="!farmInfo.farmInfoUrl && !farmInfo.farmInfoVideo">
            <img src="@/assets/img_logo_nodata.png"/>
            <span>农场还没有添加说明，请稍后查看～</span>
          </div>
          <div v-show="farmInfo.farmInfoUrl || farmInfo.farmInfoVideo">
            <div class="farm-video">
              <!-- <div class="farm-video-init">
                <img src="http://yun.it7090.com/video/XHLaunchAd/video01.mp4?vframe/jpg/offset/3" />
                <img src="@/assets/icon_video_play.png"/>
              </div> -->
              <!-- <video
                v-show="farmInfo.farmInfoVideo"
                :src="farmInfo.farmInfoVideo"
                controls="controls"
                style="height: 100%"
                autoplay="autoplay"
                preload="auto"
                webkit-playsinline="true"
                playsinline="true"
                :poster="farmInfo.farmInfoVideo + '?vframe/jpg/offset/3'"
              >
              </video> -->
              <div id="youkuplayer" class="youku-container"></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <img class="farm-content-divide" src="../../assets/img_detail_title_left.png"/>
              <span class="farm-content-title">农场介绍</span>
              <img class="farm-content-divide" src="../../assets/img_detail_title_right.png"/>
            </div>
            <img class="farm-conten-info-url" :src="farmInfo.farmInfoUrl" />
          </div>
        </mt-tab-container-item>
        <mt-tab-container-item id="3">
          <div class="farm-tab-nodata" v-show="!plantHis || plantHis.length === 0">
            <img src="@/assets/img_logo_nodata.png"/>
            <span>农场还没有人员认种，快来加入我们吧～</span>
          </div>
          <div class="plant-people" v-show="plantHis && plantHis.length > 0">
            <div v-for="(item, i) in plantHis" class="plant-people-item" :key="i">
              <img :src="item.headImg"/>
              <div>{{ item.userName }}</div>
            </div>
          </div>
        </mt-tab-container-item>
      </mt-tab-container>
    </div>
    <transition name="back-to-top-fade">
      <div ref="backToTop" class="back-to-top" v-show="visible" @click="backToTop">
      </div>
    </transition>
    <div v-show="bottomVisible && selected !== '3'" class="bottom-btn">
      <mt-button v-show="selected === '1'" class="farm-comment-btn-style" type="primary" @click="handleMessageClick">吐槽</mt-button>
      <div v-show="selected === '2'" class="farm-content-info-btn">
        <mt-button @click="handleBuyPro" class="farm-content-info-buy" type="primary">选购农产品</mt-button>
        <mt-button @click="handlePlant" class="farm-content-info-plant" type="primary">直接认种</mt-button>
      </div>
    </div>
  </div>
</template>
<script>
import { Spinner, Header, Button, Progress, Navbar, TabItem, TabContainer, TabContainerItem, Badge, InfiniteScroll } from 'mint-ui'
// import './custom-theme.css'
import Vue from 'vue'
import Ellipsis from '../base/ellipsis-plus'
import storage from '@/utils/storage'
import sStorage from '@/utils/sessionStorage'
import apis from '@/components/base/api'
import fetchData from '@/utils/fetch'
import moment from 'moment'
const wx = require('weixin-js-sdk')
// const wx = require('weixin-js-sdk')

Vue.use(InfiniteScroll)

export default {
  name: 'LiveDetail',
  mounted () {
    window.scrollTo(0 ,0)
    const vm = this
    // setTimeout(() => {
    //   vm.videoControlStatus = false
    // }, 3000)
    const hiddenProperty = 'hidden' in document ? 'hidden' : 'webkitHidden' in document ? 'webkitHidden' : 'mozHidden' in document ? 'mozHidden' : null
    const visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange')
    const onVisibilityChange = function () {
      if (document[hiddenProperty]) {
        // console.log('页面非激活')
      } else {
        // console.log('页面激活')
      }
    }
    document.addEventListener(visibilityChangeEvent, onVisibilityChange)

    const audio = document.querySelector('#audioTag')
    this.audio = audio
    audio.addEventListener('timeupdate', this.updateProgress, false)
    const token = sStorage.get('token')
    const params = this.$route.params
    document.title = params.liveTitle || ''
    this.farmNo = params.liveId
    // const farmNo = paramsUtils.url2json(location).farmNo
    fetchData(apis.farmDetail, { accessToken: token, farmNo: params.liveId, platform: this.isInWX ? '1' : '2' }).then(res => {
      if (res.code === 0) {
        vm.videoDetail = res.data.detail
        vm.plantInfo = res.data.plant
        vm.farmInfo = res.data.farmInfo
        vm.message = res.data.message
        vm.plantHis = res.data.plantHis
        if (this.isInWX) {
          const share = res.data.share
          // const urlArr = location.href.split('#').splice(0, 1)
          // const url = urlArr.join('#')
          this.$getJsConfig(location.href.split('#')[0], [], function () {
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
            wx.onMenuShareTimeline({
              title: '强势围观 | 已有' + res.data.plant.saleCount + '人，花费' + share.price + '元成为' + res.data.detail.farmName + '的农场主',
              link: 'http://mall.91ncp.com.cn/?no=' + res.data.detail.farmNo + '#/',
              imgUrl: res.data.detail.shareImg,
              success: function () {}
            })
            wx.onMenuShareAppMessage({
              title: '强势围观 | 已有' + res.data.plant.saleCount + '人，花费' + share.price + '元成为' + res.data.detail.farmName + '的农场主',
              desc: '您的好友' + share.nickName + '已成为' + res.data.detail.farmName + '的农场主，一起来看看吧 ~',
              link: 'http://mall.91ncp.com.cn/?no=' + res.data.detail.farmNo + '#/',
              imgUrl: res.data.detail.shareImg,
              type: '',
              dataUrl: '',
              success: function () {
              }
            })
            wx.onMenuShareQQ({
              title: '强势围观 | 已有' + res.data.plant.saleCount + '人，花费' + share.price + '元成为' + res.data.detail.farmName + '的农场主',
              desc: '您的好友' + share.nickName + '已成为' + res.data.detail.farmName + '的农场主，一起来看看吧 ~',
              link: 'http://mall.91ncp.com.cn/?#/live/' + res.data.detail.farmNo + '/detail/null',
              imgUrl: res.data.detail.shareImg,
              success: function () {
              }
            })
          })
        }
        document.title = res.data.detail.farmName
        this.player = window.videojs('my_video_player', {
          controls: false,
          autoplay: false,
          preload: 'auto',
          loop: false
        }, function () {
        })
        this.player.src({
          src: res.data.detail.videoUrl,
          type: 'application/x-mpegURL'
        })
        this.player.load()
        this.ykPlayer = new window.YKU.Player('youkuplayer', {
          styleid: '0',
          client_id: 'd0d4ff36fe1ac456',
          vid: 'XMzc3OTU1MTUzNg==',
          newPlayer: true
        })
        // ykPlayer.playVideo()
        // this.player.play()
        this.messageRead(res.data.message.map(item => item.messageNo))
        
      }
    })
    this.refreshInt = setInterval(() => {
      fetchData(apis.refresh, { accessToken: token, farmNo: params.liveId, platform: this.isInWX ? '1' : '2' }).then(res => {
        if (res.code === 0) {
          vm.newMessages = res.data.newMessages
          vm.videoDetail.videos = res.data.videos
          vm.plantInfo.saleCount = res.data.saleCount
          vm.plantInfo.peopleCount = res.data.peopleCount
          vm.videoDetail.videoStatus = res.data.videoStatus
          if (res.data.newMessages > 0) {
            vm.isAllData = false
          }
        }
      })
    }, 5000)
    console.log(this.$router)
    window.smoothscroll = () => {
      let currentScroll = document.documentElement.scrollTop || document.body.scrollTop
      if (currentScroll > 0) {
        window.requestAnimationFrame(window.smoothscroll)
        window.scrollTo(0, Math.floor(currentScroll - (currentScroll / 5)))
      }
    }
    window.addEventListener('scroll', this.catchScroll)
  },
  destroyed () {
    this.player.dispose()
    this.refreshInt && clearInterval(this.refreshInt)
    window.removeEventListener('scroll', this.catchScroll)
  },
  data () {
    return {
      isInWX: storage.get('isInWX'),
      liveTitle: '',
      selected: '1',
      visible: false,
      plantInfo: {},
      farmInfo: {},
      message: [],
      videoDetail: '',
      audio: { paused: true },
      audioProgress: 0,
      videoControlStatus: true,
      newMessages: 0,
      currentPage: 1,
      plantHis: [],
      pageLoading: false,
      audioStatus: false,
      refreshInt: null,
      isAllData: false,
      bottomVisible: false,
      navbarFixed: false
    }
  },
  beforeRouteEnter (to, from, next) {
    console.log(to)
    next(vm => {
      vm.liveTitle = to.params.liveTitle
    })
  },
  computed: {
    getLiveTitle: function () {
      return this.$router
    }
  },
  components: {
    [Header.name]: Header,
    [Progress.name]: Progress,
    [Navbar.name]: Navbar,
    [TabItem.name]: TabItem,
    [TabContainer.name]: TabContainer,
    [TabContainerItem.name]: TabContainerItem,
    [Ellipsis.name]: Ellipsis,
    [Badge.name]: Badge,
    [Spinner.name]: Spinner,
    // [InfiniteScroll.name]: InfiniteScroll,
    [Button.name]: Button
  },
  watch: {
    selected: function (value) {
      const vm = this
      const params = this.$route.params
      const token = sStorage.get('token')
      if (value === '1') {
        fetchData(apis.messageLoad, { currentPage: 1, accessToken: token, farmNo: params.liveId, platform: this.isInWX ? '1' : '2' }).then(res => {
          if (res.code === 0) {
            vm.message = res.data.result
            vm.currentPage = 1
            vm.newMessages = 0
            vm.messageRead(res.data.result.map(item => item.messageNo))
          }
        })
      }
    }
  },
  methods: {
    genMsgTime (time) {
      const res = new Date().getTime() - time
      if (res < 5000) {
        return '刚刚'
      } else if (res < 60000) {
        return Math.round(res / 1000) + '秒'
      } else if (res < 3600000) {
        return Math.round(res / 60000) + '分钟'
      } else if (res < 86400000) {
        return Math.round(res / 3600000) + '小时'
      } else {
        return moment(time).format('YYYY-MM-DD')
      }
    },
    goBack: function () {
      this.$router.go(-1)
    },
    initialize () {
    },
    navbarClick (id) {
      this.selected = id
    },
    backToTop () {
      window.smoothscroll()
    },
    catchScroll () {
      const navbar = this.navbar || (this.$refs.navbar.$el.offsetTop && (this.navbar = this.$refs.navbar.$el.offsetTop))
      // const navbarOffset = navbar - document.documentElement.scrollTop
      // if (navbarOffset <= 0) {
      //   this.navbarFixed = true
      // } else {
      //   this.navbarFixed = false
      // }
      this.navbarFixed = (window.pageYOffset >= navbar)
      this.visible = (window.pageYOffset > 300)
      this.bottomVisible = (window.pageYOffset > 740)
    },
    handlePlant () {
      this.$router.push({ path: '/plant/' + this.plantInfo.plantNo })
    },
    handleBuyPro () {
      location.href = 'https://h5.youzan.com/v2/showcase/feature?alias=xntv0G9Twq'
    },
    handleGoProduct (mallNo) {
      location.href = 'https://h5.youzan.com/v2/goods/' + mallNo
    },
    handleMessageClick () {
      this.$router.push({ path: '/comment/' + this.farmNo })
    },
    changeAudioState () {
      if (this.audio.paused) {
        this.audio.play()
        this.audioStatus = true
      } else {
        this.audio.pause()
        this.audioStatus = false
      }
    },
    updateProgress () {
      const value = Math.round((Math.floor(this.audio.currentTime) / Math.floor(this.audio.duration)) * 100, 0)
      this.audioProgress = value
      if (value + '' === '100') {
        this.audio.pause()
        this.audio.currentTime = 0
        this.audioStatus = false
      }
    },
    handleFullscreen () {
      const element = this.player
      element.requestFullscreen()
      if (element.requestFullscreen) {
        element.requestFullscreen()
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen()
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen()
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen()
      }
    },
    loadMore () {
      if (this.isAllData) {
        return
      }
      const vm = this
      const params = this.$route.params
      const token = sStorage.get('token')
      !this.isAllData && !this.pageLoading && fetchData(apis.messageLoad, { currentPage: this.currentPage + 1, accessToken: token, farmNo: params.liveId, platform: this.isInWX ? '1' : '2' }).then(res => {
        if (res.code === 0) {
          vm.message = [...vm.message, ...res.data.result]
          if (res.data.result && res.data.result.length > 0) {
            vm.currentPage = res.data.page.currentPage
          } else {
            vm.currentPage = res.data.page.currentPage - 1
            vm.isAllData = true
          }
          this.pageLoading = false
          vm.messageRead(res.data.result.map(item => item.messageNo))
        }
      })
      this.pageLoading = true
    },
    messageRead (messageNos) {
      const params = this.$route.params
      const token = sStorage.get('token')
      fetchData(apis.messageRead, { messageNos, accessToken: token, farmNo: params.liveId, platform: this.isInWX ? '1' : '2' }).then(res => {
        if (res.code === 0) {
        }
      })
    },
    previewCommentImg (url, urls) {
      wx.previewImage({
        current: url,
        urls
      })
    },
    comdify (n) {
      if (n) {
        n = n + ''
        const re = /\d{1,3}(?=(\d{3})+$)/g
        const n1 = n.replace(/^(\d+)((\.\d+)?)$/, function (s, s1, s2) {
          return s1.replace(re, '$&,') + s2
        })
        return n1
      } else {
        return '0'
      }
    }
  }
}
</script>
<style lang="less" src="./styles.less" scoped></style>
