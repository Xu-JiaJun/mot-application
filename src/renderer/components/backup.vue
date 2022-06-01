<template>
  <div id="wrapper">
    <main>
      <el-tabs :tab-position="tabPosition" style="height: 550px;">
        <!--第一标签页，视频跟踪-->
        <el-tab-pane label="视频跟踪">
          <div class="pane-area">
            <el-row>
              <h2>视频跟踪</h2>
            </el-row>
            <el-row>
              <el-form
                  ref="form"
                  :model="video_track_form"
                  label-width="100px">
                <el-form-item label="视频路径">
                  <el-input v-model="video_track_form.input_dir"
                            class="path-input-area"
                            :disabled="true">
                  </el-input>
                  <el-button @click="choseVideoTrackInputPath">选择文件</el-button>
                </el-form-item>
                <el-form-item label="输出路径">
                  <el-input v-model="video_track_form.output_dir"
                            class="path-input-area"
                            :disabled="true">
                  </el-input>
                  <el-button @click="choseVideoTrackOutputPath">选择路径</el-button>
                </el-form-item>
                <el-form-item label="置信阈值">
                  <el-slider
                      v-model="video_track_form.thres"
                      :max="1"
                      :step="0.1"
                      show-stops
                      show-input>
                  </el-slider>
                </el-form-item>
                <el-form-item label="生成视频">
                  <el-switch v-model="video_track_form.gen_video"></el-switch>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="submitVideoTrackForm">开始跟踪</el-button>
                  <el-button @click="resetVideoTrackForm">重置</el-button>
                </el-form-item>
              </el-form>
            </el-row>
            <el-row>
              <el-collapse>
                <el-collapse-item title="追踪日志" name="1">
                  <ul class="log-list">
                    <li v-for="l in video_track_param.track_logs" class="log-line">{{ l }}</li>
                  </ul>
                </el-collapse-item>
              </el-collapse>
            </el-row>
          </div>
        </el-tab-pane>
        <!--第二标签页，视频帧跟踪-->
        <el-tab-pane label="视频帧跟踪">
          <div class="pane-area">
            <el-row>
              <h2>视频帧跟踪</h2>
            </el-row>
            <el-row>
              <el-form
                  ref="form"
                  :model="frame_track_form"
                  label-width="100px">
                <el-form-item label="帧文件夹路径">
                  <el-input v-model="frame_track_form.input_dir"
                            class="path-input-area"
                            :disabled="true">
                  </el-input>
                  <el-button @click="choseFrameTrackInputPath">选择路径</el-button>
                </el-form-item>
                <el-form-item label="输出路径">
                  <el-input v-model="frame_track_form.output_dir"
                            class="path-input-area"
                            :disabled="true">
                  </el-input>
                  <el-button @click="choseFrameTrackOutputPath">选择路径</el-button>
                </el-form-item>
                <el-form-item label="置信阈值">
                  <el-slider
                      v-model="frame_track_form.thres"
                      :max="1"
                      :step="0.1"
                      show-stops
                      show-input>
                  </el-slider>
                </el-form-item>
                <el-form-item label="生成视频">
                  <el-switch v-model="frame_track_form.gen_video"></el-switch>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="submitFrameTrackForm">开始跟踪</el-button>
                  <el-button>重置</el-button>
                </el-form-item>
              </el-form>
            </el-row>
            <el-row>
              <el-collapse>
                <el-collapse-item title="追踪日志" name="2">
                  <ul class="log-list">
                    <li v-for="l in frame_track_param.track_logs" class="log-line">{{ l }}</li>
                  </ul>
                </el-collapse-item>
              </el-collapse>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>

    </main>
  </div>
</template>

<script>
import {remote} from "electron";
import VideoTrackPage from './LandingPage/VideoTrackPage'
import FrameTrackPage from './LandingPage/FrameTrackPage'

const baseURL = 'http://localhost:8090'
function sleep(ms) {
  return new Promise(resolve =>
      setTimeout(resolve, ms)
  )
}
export default {
  components:{
    VideoTrackPage,FrameTrackPage
  },
  data(){
    return{
      tabPosition: 'left',
      video_track_param: { suid:'', track_logs:[] },
      video_track_form: { input_dir: '', output_dir: '', thres: 0.6, gen_video: false },
      frame_track_param: { suid:'', track_logs:[] },
      frame_track_form: { input_dir: '', output_dir: '', thres: 0.6, gen_video: false },
    };
  },
  methods: {
    /*
    * 视频跟踪页面方法
    * */
    //提交视频跟踪表单
    submitVideoTrackForm(){
      let inputDir = this.video_track_form.input_dir;
      let outputDir = this.video_track_form.output_dir;
      let thres = this.video_track_form.thres;
      let gen_video = this.video_track_form.gen_video;
      let self = this;
      this.$http.post(baseURL+'/track',
          {input_dir: inputDir, output_dir: outputDir, thres: thres, gen_video: gen_video})
          .then(response=>{
            if (response.data.code === 0){
              self.getVideoTrackLog(response.data['suid'])
            }
            else{
              console.log(response.data)
            }
          }).catch(error=>{
        console.log(error);
      });
    },
    //重置视频跟踪表单
    resetVideoTrackForm(){
      this.video_track_form.input_dir = '';
      this.video_track_form.output_dir = '';
      this.video_track_form.thres = 0.6;
      this.video_track_form.gen_video = false;
    },
    //长轮询
    getVideoTrackLog(suid){
      let self = this;
      this.$http.get(baseURL+`/log?suid=${suid}`).then(response=>{
        if (response.data.code === 0){
          let logs = response.data['logs'];
          self.video_track_param.track_logs = [];
          console.log("get log")
          for (let r_index in logs){
            self.video_track_param.track_logs.push(logs[r_index])
            if (logs[r_index] === 'End')
              return
          }
        }
        else {
          console.log(response.data)
        }
        // 暂停后再次轮询
        sleep(2000).then(()=>{
          self.getVideoTrackLog(suid)
        })
      }).catch(error=>{
        console.log(error)
      })
    },
    //选择视频跟踪的视频文件路径
    choseVideoTrackInputPath(){
      let videoPath = this.choseFilePathInDialog();
      let fileExtension = videoPath.split('.').pop();
      // if (fileExtension === 'mp4')
      if (videoPath !== '')
        this.video_track_form.input_dir = videoPath;
    },
    //选择视频跟踪的输出路径
    choseVideoTrackOutputPath(){
      let outputPath = this.choseDirectoryPathInDialog();
      if (outputPath !== '')
        this.video_track_form.output_dir = outputPath;
    },
    /*
    * 以下为视频帧跟踪方法
    * */
    //提交视频帧跟踪表单
    submitFrameTrackForm(){
      let inputDir = this.frame_track_form.input_dir;
      let outputDir = this.frame_track_form.output_dir;
      let thres = this.frame_track_form.thres;
      let gen_video = this.frame_track_form.gen_video;
      let self = this;
      this.$http.post(baseURL+'/track_frame',
          {input_dir: inputDir, output_dir: outputDir, thres: thres, gen_video: gen_video})
          .then(response=>{
            if (response.data.code === 0){
              self.getFrameTrackLog(response.data['suid'])
            }
            else{
              console.log(response.data)
            }
          }).catch(error=>{
        console.log(error);
      });
    },
    //帧跟踪长轮询
    getFrameTrackLog(suid){
      let self = this;
      this.$http.get(baseURL+`/log?suid=${suid}`).then(response=>{
        if (response.data.code === 0){
          let logs = response.data['logs'];
          self.frame_track_param.track_logs = [];
          console.log("get log")
          for (let r_index in logs){
            self.frame_track_param.track_logs.push(logs[r_index])
            if (logs[r_index] === 'End')
              return
          }
        }
        else {
          console.log(response.data)
        }
        // 暂停后再次轮询
        sleep(2000).then(()=>{
          self.getFrameTrackLog(suid)
        })
      }).catch(error=>{
        console.log(error)
      })
    },
    //选择视频帧路径
    choseFrameTrackInputPath(){
      let frameDirPath = this.choseDirectoryPathInDialog();
      if (frameDirPath !== '')
        this.frame_track_form.input_dir = frameDirPath;
    },
    //选择视频帧跟踪输出路径
    choseFrameTrackOutputPath(){
      let outputPath = this.choseDirectoryPathInDialog();
      if (outputPath !== '')
        this.frame_track_form.output_dir = outputPath;
    },
    /*
    * 以下为工具方法
    * */
    //获取目录路径
    choseDirectoryPathInDialog(){
      const { remote } = require('electron');
      const result = remote.dialog.showOpenDialog({
        properties: ['openDirectory', "createDirectory"],
      });
      let dirName = result[0];
      if (dirName !== undefined)
        return dirName
      else
        return ''
    },
    //获取文件路径
    choseFilePathInDialog(){
      const { remote } = require('electron');
      const result = remote.dialog.showOpenDialog({
        properties: ['openFile', "showHiddenFiles"],
      });
      let filePath = result[0];
      if (filePath !== undefined)
        return filePath
      else
        return ''
    },
  }
};

</script>

<style>
*{
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
}
.pane-area{
  margin-left: 10px;
  width: 600px;
}
.path-input-area{
  width: 380px;
}
.log-list{
  overflow: auto;
  height: 100px;
}
.log-line{

}
</style>
