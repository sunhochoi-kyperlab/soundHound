<template>
  <div id="app">
    <!-- <div id="blueprint"></div> -->
    <!-- <status-bar></status-bar> -->
    <div class="container">
      <side-bar></side-bar>
      <div class="contents">
        <voice-chrome></voice-chrome>
        <router-view class="voice-chrome-results" :key="$route.fullPath"></router-view>
      </div>
      <temp-gadget></temp-gadget>
    </div>
  </div>
</template>

<script>
import StatusBar from '@/components/StatusBar.vue'
import SideBar from '@/components/SideBar.vue'
import VoiceChrome from '@/components/VoiceChrome.vue'
import TempGadget from '@/components/TempGadget.vue'

export default {
  name: 'App',
  components: {
    'status-bar': StatusBar,
    'side-bar': SideBar,
    'voice-chrome': VoiceChrome,
    'temp-gadget': TempGadget
  },
  created () {
    this.$store.dispatch('vpa/initialize')
  }
}
</script>

<style lang="scss">
@import './styles/rnbs9pr.scss';
@font-face {
  font-family: 'NotoSansCJKkr-Regular';
  // src: local('Noto Sans CJK KR Regular')
  src: url('./styles/font/NotoSansCJKkr-Regular.otf') format('opentype');
}
@font-face {
  font-family: 'NotoSansCJKkr-Medium';
  // src: local('Noto Sans CJK KR Regular')
  src: url('./styles/font/NotoSansCJKkr-Medium.otf') format('opentype');
}
* { font-family:'NotoSansCJKkr-Regular'; }
#blueprint{
  position: absolute;
  width: 1280px;
  height: 650px;
  z-index: 100;
  opacity: 0.4;
  // background-image: url('./styles/img/houndify_idle.png')
}
#app {
  width: 1280px;
  height: 650px;
  color: #ffffff;
}
.container {
  width: 1280px;
  height: 650px;
  display: flex;
  flex-direction: row;
  background: #0b0d1f;
  .contents {
    width: 1154px;
    height: 650px;
    display: flex;
    flex-direction: column;
    .voice-chrome-results {
      // border-right: 1px solid hsla(0,0%,100%,.1);
      display: flex;
      .response-text {
        width: 100%;
        position: absolute;
        top: 0;
        left: 164px;
        display: flex;
        align-items: center;
        height: 129px;
        p {
          width: 970px;
          font-size: 33px; 
          color: #fff;
          line-height: 37px;  
          vertical-align: middle;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      }
      .fallback-card {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        .main-text {
          width: 100%;
          font-size: 33px;
          color: #fff;
          line-height: 55px;
          padding: 21px 40px 14px;
        }
        .sub-text {
            font-size: 28px;
            color: #79787f;
            line-height: 32px;
            margin-left: 40px;
        }
      }
    }
  }
}
.overlay {
  width: 1795px;
  height: 650px;
  margin-top: 70px;
  margin-left: 125px;
  background-color: transparent;
  .popup {
    width: 660px !important;
    height: 340px;
    font-size: 35px;
    color: #acacac;
    background-color: #13161b;
    .title {
      margin-top: 18px;
      margin-bottom: -26px;
      .title-inner {
        font-size: 35px;
        letter-spacing: -2px;
      }
    }
    .content-area {
      .text {
        line-height: 42px;
      }
    }
    .btn-area {
      height: 100px;
      font-size: 35px;
      color: #acacac;
    }
  }
}
</style>
