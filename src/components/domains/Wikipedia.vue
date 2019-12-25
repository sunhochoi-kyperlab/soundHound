<template>
  <div>
    <div class="wikipedia-card" :class="fadeoutResults">
      <p class="main-text">{{results.SpokenResponse}}</p>
      <p class="sub-text">Wikipedia</p>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { VOICE_CHROME } from '@/js/defines'

export default {
  name: 'Wikipedia',
  computed: {
    ...mapState({
      vcState: (state) => state.voiceChrome.voiceChromeState
    }),
    ...mapGetters({
      results: 'obigo/results'
    }),
    fadeoutResults () {
      return this.vcState === VOICE_CHROME.LISTENING || this.vcState === VOICE_CHROME.THINKING ? 'fade-out' : ''
    }
  },
  created () {
    console.log(this.$options.name, 'results:', this.results)
    // PLAY_TTS
    this.$store.dispatch('vpa/playTTS', {audioBytes: this.results.ResponseAudioBytes})
  }
}
</script>

<style lang="scss" scoped>
.wikipedia-card {
  &.fade-out {
    opacity: .5;
  }
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
</style>
