import Vue from 'vue'
import Router from 'vue-router'

import FrameTrackPage from "../components/LandingPage/FrameTrackPage";
import VideoTrackPage from "../components/LandingPage/VideoTrackPage";

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: require('@/components/LandingPage').default
    },
    {
      path: '/video_track',
      name: 'video-track-component',
      component: VideoTrackPage
    },
    {
      path: '/frame_track',
      name: 'frame-track-component',
      component: FrameTrackPage
    }
  ]
})
