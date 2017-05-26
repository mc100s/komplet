import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import Room from '@/components/Room'
import Params from '@/components/Params'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello
    },
    {
      path: '/:roomName',
      name: 'Room',
      component: Room
    },
    {
      path: '/:roomName/params',
      name: 'Params',
      component: Params
    }
  ]
})
