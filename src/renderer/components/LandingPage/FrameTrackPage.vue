<template>
<div>
  <!--第二菜单，视频帧跟踪-->
  <div class="pane-area">
    <el-row>
      <h2><i class="el-icon-picture-outline-round"></i>&nbsp;视频帧跟踪</h2>
    </el-row>
    <el-row>
      <el-form
          ref="form"
          :model="frame_track_form"
          label-width="100px">
        <el-form-item label="帧文件夹路径">
          <el-tooltip class="item" effect="dark" content="请使用右侧按钮选择帧文件夹" placement="top">
            <el-input v-model="frame_track_form.input_dir"
                      class="path-input-area"
                      :disabled="true">
            </el-input>
          </el-tooltip>
          <el-button @click="choseFrameTrackInputPath">
            <i class="el-icon-folder-add"></i>&nbsp;选择路径
          </el-button>
        </el-form-item>
        <el-form-item label="输出路径">
          <el-tooltip class="item" effect="dark" content="请使用右侧按钮选择输出路径" placement="top">
            <el-input v-model="frame_track_form.output_dir"
                      class="path-input-area"
                      :disabled="true">
            </el-input>
          </el-tooltip>
          <el-button @click="choseFrameTrackOutputPath">
            <i class="el-icon-folder-opened"></i>&nbsp;选择路径
          </el-button>
        </el-form-item>
        <el-form-item label="置信阈值">
          <el-slider
              v-model="frame_track_form.thres"
              :min="0.3"
              :max="0.8"
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
          <el-button><i class="el-icon-refresh"></i>重置</el-button>
          <el-button @click="openOutputFolder" v-if="this.frame_track_form.output_dir">打开输出文件夹</el-button>
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
</div>
</template>

<script>
import {remote, shell} from "electron";

const baseURL = 'http://localhost:8090';
function sleep(ms) {
  return new Promise(resolve =>
      setTimeout(resolve, ms)
  )
}
export default {
  name: "FrameTrackPage",
  data(){
    return{
      frame_track_param: { suid:'', track_logs:[] },
      frame_track_form: { input_dir: '', output_dir: '', thres: 0.6, gen_video: false },
    }
  },
  methods:{
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
      this.$message.info(`开始生成视频，读取${inputDir}中视频帧`);
      this.frame_track_param.track_logs.unshift(`开始生成视频，读取${inputDir}中视频帧`);
      this.$http.post(baseURL+'/track_frame',
          {input_dir: inputDir, output_dir: outputDir, thres: thres, gen_video: gen_video})
          .then(response=>{
            if (response.data.code === 0){
              self.$message.success(`开始跟踪${inputDir}!`)
              self.getFrameTrackLog(response.data['suid'])
            }
            else{
              self.$message.fail(`跟踪初始化失败！`)
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
          for (let r_index in logs){
            self.frame_track_param.track_logs.unshift(logs[r_index]);
            if (logs[r_index].indexOf('End') !== -1){
              self.$message.success('跟踪完成!');
              return;
            }
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
    //打开输出文件夹
    openOutputFolder(){
      const shell = require('electron').shell
      shell.openItem(this.frame_track_form.output_dir);
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
}
</script>

<style scoped>
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