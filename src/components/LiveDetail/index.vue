<template>
  <div class="live-detail">
    <mt-header v-if="!isInWX" class="live-header" fixed>
      <mt-button slot='left' icon='back' @click="goBack"><strong>{{ liveTitle }}</strong></mt-button>
    </mt-header>
    <div  :class="isInWX ? 'live-content in-wx' : 'live-content'">
      <video webkit-playsinline="true" ref="video" playsinline id="my_video_player" class="video-style video-js vjs-default-skin vjs-big-play-centered"
  data-setup='{}'>
        <source src="http://hls.open.ys7.com/openlive/322ce6a69dea42edb771566dee7869bf.m3u8 " type="application/x-mpegURL" />
      </video>
      <div class="video-tag">
        {{ '直播中' }}
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
      <mt-progress class="race-progress" :value="plantInfo.saleCount ? parseInt(plantInfo.saleCount * 100 / plantInfo.targetCount) : 0" :bar-height="3">
        <div slot="end">{{ (plantInfo.saleCount ? parseInt(plantInfo.saleCount * 100 / plantInfo.targetCount) : 0) + '%' }}</div>
      </mt-progress>
    </div>
    <div class="live-data-content">
      <div class="live-data-item">
        <span class="live-data-item-num">{{ plantInfo.targetCount }}</span>
        <span class="live-data-item-des">{{ plantInfo.targetUnit }}</span>
      </div>
      <div class="live-data-item">
        <span class="live-data-item-num">{{ plantInfo.saleCount }}</span>
        <span class="live-data-item-des">{{ plantInfo.saleUnit }}</span>
      </div>
      <div class="live-data-item">
        <span class="live-data-item-num">{{ plantInfo.peopleCount }}</span>
        <span class="live-data-item-des">{{ plantInfo.peopleUnit }}</span>
      </div>
    </div>
    <div class="live-owner">
      <img class="live-owner-img" :src="plantInfo.farmerPic" />
      <div class="live-owner-data">
        <audio style="display: none" id="audioTag" src="http://cdn.xxtao.com/cms/audio/yesterday_once_more.mp3" ></audio>
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
          <img @click="changeAudioState" class="play-pause" id="playPause" :src="audio.paused ? require('@/assets/icon_voice_play.png') : require('@/assets/icon_voice_stop.png') " />
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
    <img class="live-divider" src="../../assets/img_detail_separatorcolumn.png"/>
    <div class="farm-product">
      <span>农场产品</span>
      <ul>
        <li v-for="(item) in farmInfo.farmGoods || []" :key="item.goodsNo" @click="handleGoodsClick(item)">
          <div class="farm-pro-img"><img :src="item.goodsImg" /></div>
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
      <mt-navbar class="farm-navbar" v-model="selected">
        <mt-tab-item id="1">
          <div style="position: relative">
            <span>吐槽区</span>
            <mt-badge v-show="!!newMessages" color="#FF3E3E" size="small" style="position: absolute; top: -9px; right: 9px">8</mt-badge>
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
          <ul v-show="message && message.length > 0" v-infinite-scroll="loadMore" infinite-scroll-disabled="pageLoading" infinite-scroll-distance="10">
            <li
              v-for="(item) in message"
              :key="item.messageNo"
              style="display: flex; border-bottom: 1px rgba(231,231,231,1) solid"
            >
              <img class="comment-img" :src="item.headImg"/>
              <div style="flex: 1;">
                <div class="comment-title">
                  <span>{{ item.userName }}</span>
                  <span>{{ item.messageTime }}</span>
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
                      <img :src="imgUrl.imgUrl" />
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
          <div class="farm-comment-btn">
            <mt-button class="farm-comment-btn-style" type="primary" @click="handleMessageClick">吐槽</mt-button>
          </div>
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
              <video
                src="http://yun.it7090.com/video/XHLaunchAd/video01.mp4"
                controls="controls"
                style="height: 100%"
                autoplay="autoplay"
                preload="auto"
                webkit-playsinline="true"
                playsinline="true"
                x-webkit-airplay="allow"
                x5-video-player-type="h5"
                x5-video-player-fullscreen="true"
                poster="http://yun.it7090.com/video/XHLaunchAd/video01.mp4?vframe/jpg/offset/3"
              >
              </video>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <img class="farm-content-divide" src="../../assets/img_detail_title_left.png"/>
              <span class="farm-content-title">农场介绍</span>
              <img class="farm-content-divide" src="../../assets/img_detail_title_right.png"/>
            </div>
            <img :src="farmInfo.farmInfoUrl" />
            <div class="farm-content-info-btn">
              <mt-button class="farm-content-info-buy" type="primary">选购农产品</mt-button>
              <mt-button class="farm-content-info-plant" type="primary">直接认种</mt-button>
            </div>
          </div>
        </mt-tab-container-item>
        <mt-tab-container-item id="3">
          <div class="farm-tab-nodata" v-show="!plantHis || plantHis.length === 0">
            <img src="@/assets/img_logo_nodata.png"/>
            <span>农场还没有人员认种，快来加入我们吧～</span>
          </div>
          <div class="plant-people" v-show="plantHis && plantHis.length > 0">
            <div v-for="(item, i) in plantHis" class="plant-people-item" :key="i">
              <img src="item.headImg"/>
              <div>{{ userName }}</div>
            </div>
          </div>
        </mt-tab-container-item>
      </mt-tab-container>
    </div>
    <transition name="back-to-top-fade">
      <div ref="backToTop" class="back-to-top" v-show="visible" @click="backToTop">
      </div>
    </transition>
  </div>
</template>
<script>
import { Header, Button, Progress, Navbar, TabItem, TabContainer, TabContainerItem, Badge, InfiniteScroll } from 'mint-ui'
// import './custom-theme.css'
import Ellipsis from '../base/ellipsis-plus'
import storage from '@/utils/storage'
import sStorage from '@/utils/sessionStorage'
import apis from '@/components/base/api'
import fetchData from '@/utils/fetch'

export default {
  name: 'LiveDetail',
  mounted () {
    const vm = this
    // setTimeout(() => {
    //   vm.videoControlStatus = false
    // }, 3000)
    const audio = document.querySelector('#audioTag')
    this.audio = audio
    audio.addEventListener('timeupdate', this.updateProgress, false)
    const token = sStorage.get('token')
    const params = this.$route.params
    document.title = params.liveTitle
    this.farmNo = params.liveId
    // const farmNo = paramsUtils.url2json(location).farmNo
    fetchData(apis.farmDetail, { accessToken: token, farmNo: params.liveId, platform: this.isInWX ? '1' : '2' }).then(res => {
      if (res.code === 0) {
        vm.videoDetail = res.data.detail
        vm.plantInfo = res.data.plant
        vm.farmInfo = res.data.farmInfo
        vm.message = res.data.message
        vm.plantHis = res.data.plantHis
      }
    })
    setInterval(() => {
      fetchData(apis.refresh, { accessToken: token, farmNo: params.liveId, platform: this.isInWX ? '1' : '2' }).then(res => {
        if (res.code === 0) {
          vm.newMessages = res.data.newMessages
          vm.videoDetail.videos = res.data.videos
          vm.plantInfo.saleCount = res.data.saleCount
          vm.plantInfo.peopleCount = res.data.peopleCount
          vm.videoDetail.videoStatus = res.data.videoStatus
        }
      })
    }, 5000)
    console.log(this.$router)
    this.player = window.videojs('my_video_player', {
      controls: false,
      autoplay: false,
      preload: 'auto',
      loop: false
      // controlBar: {
      //   remainingTimeDisplay: false,
      //   // progressControl: false,
      //   volumePanel: false
      // }
    }, function () {
      // const newBtn = document.createElement('button')
      // newBtn.className = 'ext-vjs-controls-btn vjs-controls'
      // newBtn.innerHTML = '1'
      // const controlBar = document.getElementsByClassName('vjs-control-bar')[0]
      // const insertBeforeNode = document.getElementsByClassName('vjs-fullscreen-control')[0]
      // controlBar.insertBefore(newBtn, insertBeforeNode)
    })
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
      currentPage: 1
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
    [InfiniteScroll.name]: InfiniteScroll,
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
      this.visible = (window.pageYOffset > 300)
    },
    handlePlant () {
      this.$router.push({ path: '/plant/' + this.plantInfo.plantNo })
    },
    handleGoodsClick (goods) {
      // TODO
    },
    handleMessageClick () {
      this.$router.push({ path: '/comment/' + this.farmNo })
    },
    changeAudioState () {
      if (this.audio.paused) {
        this.audio.play()
      } else {
        this.audio.pause()
      }
    },
    updateProgress () {
      const value = Math.round((Math.floor(this.audio.currentTime) / Math.floor(this.audio.duration)) * 100, 0)
      this.audioProgress = value * 0.907
    },
    handleFullscreen () {
      // consst element = this.player
      // element.requestFullscreen()
      // if (element.requestFullscreen) {
      //   element.requestFullscreen()
      // } else if (element.mozRequestFullScreen) {
      //   element.mozRequestFullScreen()
      // } else if (element.webkitRequestFullscreen) {
      //   element.webkitRequestFullscreen()
      // } else if (element.msRequestFullscreen) {
      //   element.msRequestFullscreen()
      // }
    },
    loadMore () {
      const vm = this
      const params = this.$route.params
      const token = sStorage.get('token')
      this.pageLoading = true
      fetchData(apis.messageLoad, { currentPage: this.currentPage + 1, accessToken: token, farmNo: params.liveId, platform: this.isInWX ? '1' : '2' }).then(res => {
        if (res.code === 0) {
          vm.message = vm.message.concat(res.data.result)
          vm.currentPage += 1
          this.pageLoading = false
          vm.messageRead(res.data.result.map(item => item.messageNo))
        }
      })
    },
    messageRead (messageNo) {
      const params = this.$route.params
      const token = sStorage.get('token')
      fetchData(apis.messageRead, { messageNo, accessToken: token, farmNo: params.liveId, platform: this.isInWX ? '1' : '2' }).then(res => {
        if (res.code === 0) {
        }
      })
    }
  }
}
</script>
<style lang="less" src="./styles.less" scoped></style>
