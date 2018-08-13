<template>
  <div class="ellipsis-plus" ref="container">
    <span class="ellipsis-plus-txt" ref="txt">中</span>
    <span class="ellipsis-plus-ellipsis" ref="ellipsis" :style="{'display':show?'none':'inline-block'}">{{ ellipsis }}</span>
    <button class="ellipsis-plus-button" v-if="showButtonData" ref="more" @click="handleClick">{{ show ? collapseText: expandText }}</button>
  </div>
</template>
<script>
export default {
  name: 'ellipsis-plus',
  props: {
    text: String,
    line: {
      type: Number,
      default: 2
    },
    ellipsis: {
      type: String,
      default: '...'
    },
    showButton: {
      type: Boolean,
      default: true
    },
    expandText: {
      type: String,
      default: '全文',
      validator (value) {
        return value && value.trim().length
      }
    },
    collapseText: {
      type: String,
      default: '收起',
      validator (value) {
        return value && value.trim().length
      }
    }
  },
  data () {
    return {
      tmpTxt: '',
      show: false,
      marginLeft: 0,
      collapseMarginLeft: 0,
      showButtonData: this.showButton,
      lineData: this.line
    }
  },
  created () {
  },
  mounted () {
    if (!this.lineData) {
      return
    }
    this.lineData += 1
    let everywidth = this.$refs.txt.offsetWidth
    this.$refs.txt.innerHTML = this.text
    let containerWidth = this.$refs.container.offsetWidth
    let btnWidth = 0
    let btnWidthExpand = 0
    let ellipsisWidth = this.$refs.ellipsis.offsetWidth
    if (this.showButtonData) {
      btnWidthExpand = btnWidth = Math.ceil(parseFloat(getComputedStyle(this.$refs.more, null)['width'].replace('px', '')))
      this.$refs.ellipsis.style.display = 'none'
      let left = 0
      let btnClone = this.$refs.more.cloneNode()
      if (this.expandText !== this.collapseText) {
        this.$refs.more.style.display = 'none'
        btnClone.innerHTML = this.collapseText
        btnClone.style.display = 'inline-block'
        this.$refs.container.appendChild(btnClone)
        btnWidthExpand = Math.ceil(parseFloat(getComputedStyle(btnClone, null)['width'].replace('px', '')))
        left = btnClone.offsetLeft
      }
      if (btnClone.offsetTop <= this.$refs.ellipsis.offsetTop) {
        this.marginLeft = (containerWidth - btnWidthExpand - left + ellipsisWidth)
      } else {
        this.marginLeft = containerWidth - btnWidthExpand - left
      }
      btnClone.remove()
      this.$refs.more.style.display = 'inline-block'
      this.$refs.ellipsis.style.display = 'inline-block'
    }
    let style = getComputedStyle(this.$refs.container, null)
    let lineHeight = parseFloat(style['lineHeight'].replace('px', ''))
    this.$refs.txt.innerHTML = this.text
    if (Math.floor(this.$refs.container.offsetHeight / lineHeight) <= this.lineData) {
      this.tmpTxt = this.text
      this.show = true
      this.showButtonData = false
      return
    }
    let initNum = Math.floor((containerWidth * this.lineData - btnWidth - ellipsisWidth) / everywidth)
    let increase = 1
    this.$refs.txt.innerHTML = this.text.substr(0, initNum)
    if (Math.round(this.$refs.container.offsetHeight / lineHeight) > this.lineData) {
      increase = -1
    }
    for (let i = initNum; i < this.text.length; (i = i + increase)) {
      if (i < 0 || i > this.text.length) {
        return
      }
      this.$refs.txt.innerHTML = this.text.substr(0, i)
      if (increase === 1 && Math.round(this.$refs.container.offsetHeight / lineHeight) > this.lineData) {
        this.tmpTxt = this.text.substr(0, i - 1)
        this.$refs.txt.innerHTML = this.tmpTxt
        if (this.showButtonData) {
          let left = this.$refs.more.offsetLeft
          this.collapseMarginLeft = containerWidth - btnWidth - left - 1
        }
        break
      } else if (increase === -1 && Math.round(this.$refs.container.offsetHeight / lineHeight) === this.lineData) {
        this.tmpTxt = this.text.substr(0, i)
        this.$refs.txt.innerHTML = this.tmpTxt
        if (this.showButtonData) {
          let left = this.$refs.more.offsetLeft
          this.collapseMarginLeft = containerWidth - btnWidth - left - 1
        }
        break
      }
    }
  },
  methods: {
    handleClick () {
      if (this.show) {
        this.collapse()
      } else {
        this.expand()
      }
    },
    expand () {
      if (!this.show) {
        this.show = true
        this.$refs.txt.innerHTML = this.text
      }
    },
    collapse () {
      if (this.show) {
        this.show = false
        this.$refs.txt.innerHTML = this.tmpTxt
      }
    }
  }
}
</script>

<style>
.ellipsis-plus {
  width:100%;
  position: relative;
  line-height: 1.5;
}
.ellipsis-plus-button {
  margin-top: 7px;
  display: block !important;
  padding-top:0;
  padding-bottom:0;
  border:0;
  outline: none;
  line-height: 1;
  background-color: transparent;
  font-size: 14px;
  font-family: PingFangSC-Regular;
  color: rgba(20,186,114,1);
}
.ellipsis-plus-ellipsis {
   display: inline-block
}
.ellipsis-plus-txt {
   font-size: inherit;
}
</style>
