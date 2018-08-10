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

Vue.config.productionTip = false
if (browser.versions.wx) {
  storage.set('isInWX', true)
}

fetchData(apis.getTicket, { platform: browser.versions.wx ? '1' : '2' }).then(res => {
  if (res.code === 0) {
    sStorage.set('ticket', res.data.jsTicket)
    /* eslint-disable no-new */
    Vue.prototype.$genSignature = function (url) {
      const noncestr = 'gudong'
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
      window.wx.config({
        debug: true,
        appId: 'wxfa4b51ebc2d9ef02',
        timestamp: signatureObj.timestamp,
        nonceStr: signatureObj.nonceStr,
        signature: signatureObj.signature,
        jsApiList: [].concat(exApiArr)
      })
      window.wx.ready(ready)
      window.wx.error(error)
    }
    new Vue({
      el: '#app',
      router,
      components: { App },
      template: '<App/>'
    })
  }
})
