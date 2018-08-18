// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import './index.less'
import { browser } from './utils/utils'
import storage from './utils/storage'
import sStorage from './utils/sessionStorage'
import fetchData from './utils/fetch'
import apis from './components/base/api'
import crypto from 'crypto'
import paramsUtils from '@/utils/params'
const wx = require('weixin-js-sdk')

Vue.config.productionTip = false
if (browser.versions.wx) {
  storage.set('isInWX', true)
}

window.randomString = function (len) {
  len = len || 16
  var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  var maxPos = $chars.length
  var pwd = ''
  for (let i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return pwd
}

const init = function () {
  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    router,
    components: { App },
    template: '<App/>'
  })
}

const beforFetch = function () {
  if (browser.versions.wx) {
    fetchData(apis.getTicket, { platform: '1' }).then(res => {
      if (res.code === 0) {
        sStorage.set('ticket', res.data.jsTicket)
        Vue.prototype.$genSignature = function (url) {
          const noncestr = window.randomString()
          const timestamp = Math.floor((new Date().getTime()) / 1000)
          const obj = {
            noncestr, timestamp, url, jsapi_ticket: res.data.jsTicket
          }
          const arr = ['noncestr', 'jsapi_ticket', 'timestamp', 'url'].sort()
          let string1 = ''
          for (let i = 0; i < arr.length; i++) {
            string1 += (arr[i] + '=' + obj[arr[i]]) + '&'
          }
          string1 = string1.slice(0, string1.length - 1)
          const shasum = crypto.createHash('sha1')
          shasum.update(string1)
          const signature = shasum.digest('hex')
          return {
            timestamp,
            nonceStr: noncestr,
            signature
          }
        }
        Vue.prototype.$getJsConfig = function (url, exApiArr, ready, error) {
          const signatureObj = this.$genSignature(url)
          wx.config({
            debug: false,
            appId: 'wx650e30e3ec9bfd40',
            timestamp: signatureObj.timestamp,
            nonceStr: signatureObj.nonceStr,
            signature: signatureObj.signature,
            jsApiList: [
              'chooseWXPay',
              'closeWindow',
              'showMenuItems',
              'hideAllNonBaseMenuItem',
              'onMenuShareTimeline',
              'onMenuShareAppMessage',
              'onMenuShareQQ',
              'previewImage'
            ].concat(exApiArr)
          })
          wx.ready(ready)
          wx.error(error)
        }
        init()
      }
    })
  } else {
    init()
  }
}
if (!sStorage.get('token')) {
  const params = { platform: '2' }
  const { code, isShare } = paramsUtils.url2json(location)
  if (browser.versions.wx) {
    params.code = code
    params.platform = '1'
  }
  if (isShare + '' === '1') {
    location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx650e30e3ec9bfd40&redirect_uri=http%3a%2f%2fmall.91ncp.com.cn&response_type=code&scope=snsapi_userinfo&state=#wechat_redirect'
  } else {
    fetchData('/api/gateway/auth/getToken', params).then(res => {
      if (res.code !== 0) {
        document.write('网络错误！')
      } else {
        const token = res.data.accessToken
        sStorage.set('token', token)
        beforFetch()
      }
    })
  }
} else {
  beforFetch()
}
