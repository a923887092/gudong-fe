import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import LiveDetail from '@/components/LiveDetail/index'
import Comment from '@/components/Comment/index'
import Plant from '@/components/Plant/index'
import PersonCenter from '@/components/PersonCenter/index'
import PlantInfo from '@/components/PlantInfo/index'
import PlantRes from '@/components/PlantRes/index'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/live/:liveId/detail/:liveTitle',
      name: 'LiveDetail',
      component: LiveDetail
    },
    {
      path: '/comment/:farmNo',
      name: 'Comment',
      component: Comment
    },
    {
      path: '/plant/:plantNo',
      name: 'Plant',
      component: Plant
    },
    {
      path: '/PersonCenter',
      name: 'PersonCenter',
      component: PersonCenter
    },
    {
      path: '/infoPlant/:plantNo/price/:plantPrice',
      name: 'PlantInfo',
      component: PlantInfo
    },
    {
      path: '/resPlant/:code',
      name: 'resPlant',
      component: PlantRes
    }
  ]
})
