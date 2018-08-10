<template>
  <div class="comment">
    <mt-header v-if="!isInWX" class="comment-header" fixed>
      <mt-button slot='left' icon='back' @click="handleBack"><strong>吐槽</strong></mt-button>
    </mt-header>
    <mt-field v-model="commentContent" :class="isInWX ? 'comment-field in-wx' : 'comment-field'" type="textarea" placeholder="尽情的吐槽吧…" rows="5"></mt-field>
    <div class="comment-img">
      <div v-for="(item, i) in uploadImgs" class="comment-img-item" :key="i">
        <img class="comment-img-item-content" :src="item"/>
        <img @click="handleDelImg(i)" class="comment-img-item-delete" src="../../assets/button_delete.png"/>
      </div>
      <div v-show="uploadImgs.length < 9" class="comment-img-item" @click="handleUpload">
        <img class="comment-img-item-content" src="../../assets/button_add.png"/>
      </div>
      <input id="petCamera" type="file" accept="image/*" capture="camera" style="display: none;" @change="readFile($event)">
      <input id="petPhoto" type="file"  accept="image/*" style="display: none;" @change="readFile($event)">
      <div class="comment-btn">
        <mt-button class="comment-btn-style" type="primary" @click="handleMessageClick">发表</mt-button>
      </div>
    </div>
  </div>
</template>

<script>
import { Header, Button, Field, Toast } from 'mint-ui'
import storage from '@/utils/storage'
import sStorage from '@/utils/sessionStorage'
import * as qiniu from 'qiniu-js'
import fetchData from '@/utils/fetch'
import apis from '@/components/base/api'
export default {
  components: {
    [Field.name]: Field,
    [Header.name]: Header,
    [Button.name]: Button
  },
  data () {
    return {
      isInWX: storage.get('isInWX'),
      uploadImgs: [],
      qiniuOb: null,
      commentContent: ''
    }
  },
  mounted () {
    document.title = '吐槽'
    fetchData(apis.getUploadToken, { platform: this.isInWX ? '1' : '2' }).then(res => {
      if (res.code === 0) {
        this.token = res.data.upToken
      }
    })
  },
  methods: {
    handleUpload () {
      document.getElementById('petPhoto').click()
    },
    readFile (source) {
      let vm = this
      let file = source.target.files[0]
      let reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onloadend = function (e) {
        // let re = this.result
        // vm.canvasDataURL(re, source, file)
        vm.handleStartUpload(file)
        // vm.UploadToOss({ vm, file }).then((data) => {
        //   vm.$set(vm.fieldForm.petInfo, 'avatar', data.res.requestUrls[0].split('?')[0])
        //   source.target.value = null
        // }).catch((res) => {
        //   Toast('上传图片失败')
        //   source.target.value = null
        //   vm.$set(vm.fieldForm.petInfo, 'avatar', '')
        // })
      }
    },
    handleBack () {
      this.$router.go(-1)
    },
    handleMessageClick () {
      if (!this.commentContent) {
        Toast({
          message: '请输入吐槽内容',
          position: 'bottom'
        })
        return
      }
      const params = {
        farmNo: this.$route.params.farmNo,
        platform: this.isInWX ? '1' : '2',
        message: this.commentContent,
        messageUrl: this.uploadImgs,
        accessToken: sStorage.get('token')
      }
      fetchData(apis.message, params).then(res => {
        if (res.code === 0) {
          this.token = res.data.upToken
        }
      })
    },
    handleStartUpload (file) {
      const vm = this
      // this.token = 'KMzWptNxsPKqfyiBbf33Su_5kQUlyJ0t6d5Rg_iu:HjgY2M1udp6Cc8pfzruUHdjM2-U=:eyJzY29wZSI6Imd1ZG9uZy1mYXJtIiwiZGVhZGxpbmUiOjE1MzM4MDE2MTJ9'
      if (!this.token) {
        Toast({
          message: '服务未准备好，请稍后再试！',
          position: 'bottom'
        })
        return
      }
      const qiniuOb = qiniu.upload(file, new Date().getTime() + file.name, this.token, {}, {
        mimeType: ['image/*']
      })
      qiniuOb.subscribe({
        next (res) {
          // ...
          console.log('next' + res)
        },
        error (err) {
          // ...
          console.log('error' + err)
        },
        complete (res) {
          vm.uploadImgs.push('http://cdn.mall.91ncp.com.cn/' + res.key)
          console.log('complete' + res)
          // ...
        }
      })
    },
    handleDelImg (i) {
      console.log(1111)
      this.uploadImgs.splice(i, 1)
    }
  }
}
</script>
<style lang="less" scoped>
.comment {
  padding: 0 20px;
  &-header {
    background: #FFFFFF;
    color: #000000;
  }
  &-field {
    margin-top: 40px;
    &.in-wx {
      margin-top: 0;
    }
  }
  .comment-btn {
    display: flex;
    justify-content: center;
    margin-top: 5px;
  }
  .comment-btn-style {
    width: 335px;
    background: linear-gradient(to right, #3FE993, #14BA72);
  }
  .comment-img {
    width: 330px;
    display: flex;
    flex-wrap: wrap;
    .comment-img-item {
      width: 100px;
      height: 100px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      margin: 5px;
      position: relative;
      &-content {
        width: 100px;
        height: 100px;
      }
      &-delete {
        width: 20px;
        height: 20px;
        position: absolute;
        right: -7px;
        top: -7px;
        z-index: 10;
      }
    }
  }
}
</style>
