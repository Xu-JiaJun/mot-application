<template>
  <div id="wrapper">
    <main class="main-area">
        <el-col :span="4">
          <el-menu
              default-active="/video_track"
              router
              class="menu-area"
              @select="handleMenuSelect">

            <el-menu-item
                index="/video_track"
                route="/video_track">
              <i class="el-icon-video-camera"></i>
              <span slot="title"><b>视频跟踪</b></span>
            </el-menu-item>
            <el-menu-item
                index="/frame_track"
                route="/frame_track">
              <i class="el-icon-picture-outline-round"></i>
              <span slot="title"><b>视频帧跟踪</b></span>
            </el-menu-item>

          </el-menu>
        </el-col>
        <el-col :span="20">
          <router-view></router-view>
        </el-col>
    </main>
  </div>
</template>

<script>
export default {
  name: "LandingPage",
  data(){
    return{
    };
  },
  methods: {
    handleMenuSelect(key, keyPath){
      console.log(key, keyPath)
    },
  }
};

</script>

<style>
.main-area{
  height: 550px;
}
.menu-area{
  height: 550px;
}
</style>
