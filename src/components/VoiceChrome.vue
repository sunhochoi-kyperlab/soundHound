<template>
  <div class="voice-chrome-container">
    <div :class='["voice-chrome-circular", voiceChromeStateCSS]'>
      <div class="voice-chrome-rings">
        <div class="ring-1"></div>
        <div class="ring-2"></div>
      </div>
      <button class="voice-chrome-btn" @click="onVoiceChromeClick"></button>
      <div class="voice-chrome-text">
        <p>{{voiceChromeText === 'Speaking...' ? transcript : voiceChromeText}}</p>
      </div>
    </div>
    <!-- <div class="transcript-text">
      <p>{{transcript}}</p>
    </div> -->
    <!-- <button v-show="isCancelable" class="cancel-btn" @click="onVoiceChromeCancel"></button> -->
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { VOICE_CHROME } from '@/js/defines'

export default {
  name: 'VoiceChrome',
  computed: {
    ...mapGetters({
      voiceChromeStateCSS: 'voiceChrome/voiceChromeStateCSS',
      voiceChromeText: 'voiceChrome/voiceChromeText',
      transcript: 'voiceChrome/transcript'
    }),
    isCancelable () {
      return this.$store.state.voiceChrome.voiceChromeState !== VOICE_CHROME.IDLE
    }
  },
  methods: {
    onVoiceChromeClick () {
      console.log('onVoiceChromeClick')
      this.$store.dispatch('vpa/handleVoiceChrome')
    },
    onVoiceChromeCancel () {
      console.log('onVoiceChromeCancel')
      this.$store.dispatch('vpa/resetVoiceChrome', {redirect: true})
    }
  }
}
</script>

<style lang="scss" scoped>
.voice-chrome-container {
  width: 100%;
  height: 130px;
  border-bottom: 1px solid #31345f;
  .voice-chrome-circular {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 129px;
    .voice-chrome-rings {
      opacity: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      .ring-1, .ring-2 {
        transform: translate3d(0,0,0);
        position: absolute;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background-color: rgba(44, 112, 251975, 0.25);
        left: 39px;
        top: 25px;
      }
    }
    .voice-chrome-btn {
      display: block;
      width: 80px;
      height: 80px;
      margin: 0 46px 0 39px;
      position: relative;
      z-index: 10;
    }
    .voice-chrome-text {
        display: flex;
        align-items: center;
        p {
          width: 970px;
          font-size: 33px; 
          color: #fff;
          line-height: 43px;  
          vertical-align: middle;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          word-break: break-all;
        }
    }
  }
  .voice-chrome-circular.idle {
    .voice-chrome-btn {
      background: url('../styles/img/vc_idle.png') no-repeat;
      &:active{
          background-position: -80px 0;
      }
    }
  }
  .voice-chrome-circular.listening {
    .voice-chrome-rings {
      opacity: 1;
      .ring-1 {
        animation: ringResizing linear 2s infinite;
      }
      .ring-2 {
        animation: ringResizing linear 1.5s infinite;
      }
    }
    .voice-chrome-btn {
      background-image: url('../styles/img/vc_active.png');
    }
  }
  .voice-chrome-circular.thinking {
    .voice-chrome-btn {
      background-image: url('../styles/img/vc_active.png');
      animation: spin 3s infinite linear;
    }    
  }
  .voice-chrome-circular.speaking {
    .voice-chrome-rings {
      opacity: 1;
      .ring-1 {
        animation: ringResizing linear 2s infinite;
      }
      .ring-2 {
        animation: ringResizing linear 1.5s infinite;
      }
    }
    .voice-chrome-btn {
      background-image: url('../styles/img/vc_speaking.png');
    }    
  }
  .voice-chrome-circular.error {
    .voice-chrome-btn {
      background-image: url('../styles/img/vc_error.png');
      background-size: 80px 80px;
    }
    .voice-chrome-text {
      color: #b71b1d;
    }
  }  
  .transcript-text {
    width: 580px;
    height: 190px;
    display: flex;
    justify-content: center;
    text-align: center;
    font-size: 38px;
    color: #ffffff;
    line-height: 122%;
    margin-top: 42px;
    overflow: hidden;
  }
  .cancel-btn {
    width: 260px;
    height: 70px;
    background-image: url('../styles/img/btn-vc_cancel.png');
    position: absolute;
    bottom: 69px;

  }
}
@keyframes ringResizing {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.3);
  }
  50% {
    transform: scale(1.15);
  }
  85% {
    transform: scale(1.4);
  }
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
