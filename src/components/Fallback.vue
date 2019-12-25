<template>
  <div>
    <div class="fallback-card">
      <p class="main-text">{{fallbackText}}</p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Fallback',
  props: [
    'fallbackType'
  ],
  data () {
    return {
      fallbackText: ''
    }
  },
  computed: {
    ...mapGetters({
      results: 'obigo/results'
    })
  },
  created () {
    console.log(this.$options.name, 'results:', this.results)

    if (this.fallbackType === 'NoResultCommand') {
      this.fallbackText = `Didn't get that!`
    }

    // PLAY_TTS
    this.$store.dispatch('vpa/playTTS', {text: this.results.SpokenResponseLong}) // `Didn't get that!`
    // TEST:
    // this.$store.dispatch('vpa/playTTS', {text: 'The quick brown fox jumps over the lazy dog.'})
  }
}
</script>

<style lang="scss" scoped>
// .fallback-card {
//   flex: 1;
//   display: flex;
//   text-align: center;
//   align-items: center;
//   justify-content: center;
//   .main-text {
//     font-size: 38px;
//     color: #0197f6;
//     line-height: 127%;
//     padding: 60px;
//   }
// }
</style>
