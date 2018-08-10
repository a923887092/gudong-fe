<template>
  <div class="plant-info">
    <mt-header v-if="!isInWX" class="plant-info-header" fixed>
      <mt-button slot='left' icon='back' @click="handleBack"><strong>认种信息</strong></mt-button>
    </mt-header>
    <div class="plant-info-content">
      <span>姓名：</span>
      <mt-field attr="fontSize: 21" class="plant-info-content-field" placeholder="输入您的姓名" v-model="username"></mt-field>
      <span>手机号码：</span>
      <mt-field class="plant-info-content-field" placeholder="请输入您的手机号码" v-model="phoneNumber"></mt-field>
      <span>收货地址：</span>
      <div @click="handleAreaClick">
        <mt-field readonly class="plant-info-content-field" placeholder="选择您的省市区" v-model="areaListValue">
        <img src="../../assets/next_copy.png" class="area-icon" />
      </mt-field>
      </div>
      <mt-field class="plant-info-content-field" placeholder="输入您的详细地址" v-model="areaInfo"></mt-field>
      <div class="plant-info-protocol">
        <img @click="protocolClick(true)" v-show="!checked" src="../../assets/icon_select_unselected.png" />
        <img @click="protocolClick(false)" v-show="checked" src="../../assets/icon_select_selected.png" />
        <span>我接受</span>
        <a>《谷咚农地认种协议》</a>
      </div>
      <div class="plant-info-btn">
        <mt-button class="plant-info-btn-style" type="primary" @click="handlePlant">{{ '认种 ￥' + plantPrice + '/年' }}</mt-button>
      </div>
      <mt-popup
        class="popup-style"
        v-model="popupVisible"
        position="bottom"
      >
        <div class="popup-style-header">
          <span style="color: rgba(153,153,153,1);" @click="popupHide">取消</span>
          <span style="color: rgba(51,51,51,1);" @click="popupSubmit">确认</span>
        </div>
        <mt-picker class="popup-style-picker" valueKey="label" :slots="slots" @change="onValuesChange"></mt-picker>
      </mt-popup>
    </div>
  </div>
</template>
<script>
import { Header, Button, Field, Popup, Picker, Toast } from 'mint-ui'
import storage from '@/utils/storage'
import region from '@/components/base/province'

export default {
  components: {
    [Header.name]: Header,
    [Field.name]: Field,
    [Popup.name]: Popup,
    [Picker.name]: Picker,
    [Button.name]: Button
  },
  data () {
    return {
      isInWX: storage.get('isInWX'),
      checked: true,
      username: '',
      phoneNumber: '',
      areaInfo: '',
      popupVisible: false,
      areaList: [],
      areaListValue: '',
      plantPrice: 0,
      plantNo: '',
      slots: [
        {
          flex: 1,
          values: ['选择省份'].concat(region),
          className: 'slotProvince',
          textAlign: 'center'
        }, {
          flex: 1,
          values: ['选择城市'],
          className: 'slotCity',
          textAlign: 'center'
        }, {
          flex: 1,
          values: ['选择地区'],
          className: 'slotArea',
          textAlign: 'left'
        }
      ]
    }
  },
  mounted () {
    const vm = this
    if (this.isInWX) {
      this.$getJsConfig(location, [], function () {
        vm.wxIsReady = true
        const signatureObj = vm.$genSignature(location)
        vm.onBridgeReady(signatureObj)
      }, function () {})
    }
    document.title = '认种信息'
    const params = this.$route.params
    this.plantNo = params.plantNo
    this.plantPrice = params.plantPrice
  },
  methods: {
    protocolClick (checked) {
      this.checked = checked
    },
    handlePlant () {
      if (!this.username) {
        Toast({
          message: '请填写您的姓名',
          position: 'bottom',
          className: 'plant-info-toast'
        })
      } else if (!this.phoneNumber) {
        Toast({
          message: '请填写您的手机号码',
          position: 'bottom',
          className: 'plant-info-toast'
        })
      } else if (!this.areaListValue) {
        Toast({
          message: '请选择省市区',
          position: 'bottom',
          className: 'plant-info-toast'
        })
      } else if (!this.areaInfo) {
        Toast({
          message: '请填写详细的地址信息',
          position: 'bottom',
          className: 'plant-info-toast'
        })
      }
      // TODO 微信支付
      this.$router.push('/resPlant')
    },
    handleAreaClick () {
      this.popupVisible = !this.popupVisible
      if (this.popupVisible) {
        this.setPickerClassName()
      }
    },
    popupHide () {
      this.popupVisible = false
    },
    setPickerClassName () {
      setTimeout(() => {
        const a = document.querySelectorAll('.picker-slot-wrapper')
        Array.prototype.slice.call(a, 0).forEach(node => {
          const i = Array.prototype.slice.call(node.childNodes, 0).findIndex(item => item._prevClass === 'picker-item picker-selected')
          Array.prototype.slice.call(node.childNodes, 0).forEach((item, index) => {
            if (index === i - 1 || index === i + 1) {
              item.className = 'picker-item picker-selected-side'
            } else if (index === i) {
              item.className = 'picker-item picker-selected'
            } else {
              item.className = 'picker-item'
            }
          })
        })
      })
    },
    onValuesChange (vm, values) {
      console.log(vm, values)
      if (vm.getSlotValue(0).label) {
        vm.setSlotValues(1, ['选择城市'].concat(vm.getSlotValue(0).children))
      } else {
        vm.setSlotValues(1, ['选择城市'])
      }
      if (vm.getSlotValue(1).label) {
        vm.setSlotValues(2, ['选择地区'].concat(vm.getSlotValue(1).children))
      } else {
        vm.setSlotValues(2, ['选择地区'])
      }
      const res = vm.getValues().filter(item => !!item.label)
      if (res.length === 3) {
        this.areaList = vm.getValues().map(item => item.label)
      } else {
        this.areaList = []
      }
      this.setPickerClassName()
    },
    popupSubmit () {
      if (this.areaList.length === 3) {
        this.areaListValue = this.areaList.join(' ')
        this.popupVisible = false
      } else {
        Toast({
          message: '请选择完整的省市区',
          position: 'bottom',
          className: 'plant-info-toast'
        })
      }
    },
    handleBack () {
      this.$router.go(-1)
    },
    onBridgeReady (signatureObj) {
      window.WeixinJSBridge.invoke(
        'getBrandWCPayRequest', {
          appId: 'wx2421b1c4370ec43b',
          timeStamp: signatureObj.timestamp,
          nonceStr: signatureObj.nonceStr,
          package: 'prepay_id=u802345jgfjsdfgsdg888',
          signType: 'MD5',
          paySign: signatureObj.signature
        },
        function (res) {
          if (res.err_msg === 'get_brand_wcpay_request:ok') {
          }
        }
      )
    }
  }
}
</script>
<style src="./styles.less" lang="less" scoped>
</style>
