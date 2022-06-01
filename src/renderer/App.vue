<template>
  <div id="app">
<!--    <router-view></router-view>-->
    <landing-page></landing-page>
  </div>
</template>

<script>
import LandingPage from "./components/LandingPage";
export default {
  name: 'mot-application',
  components:{
    LandingPage
  }
}
</script>

<style>
*{
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
}
</style>
