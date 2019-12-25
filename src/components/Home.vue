<template>
  <div>
    <div class="ex" v-if="voiceChromeState === VOICE_CHROME.IDLE">
      <ul class="ex-list">
        <li class="weather">&#147; What's the weather in Paris? &#148;</li>
        <li class="location">&#147; Go to the Eiffel Tower. &#148;</li>
        <li class="songs">&#147; Play songs by BTS. &#148;</li>
        <!-- <li class="manual">&#147;Show me how to activate wipers&#148;</li> -->
      </ul>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { VOICE_CHROME } from '../js/defines'

export default {
  name: 'Home',
  data () {
    return {
      VOICE_CHROME
    }
  },
  computed: {
    ...mapState({
      voiceChromeState: state => state.voiceChrome.voiceChromeState
    })
  }
}
</script>

<style lang="scss" scoped>
.ex {
  margin-top: 66px;
  margin-left: 163px;
  .ex-list {
    height: 245px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    color: #ffffff;
    li {
      padding-left: 84px;
      font-size: 33px;
      line-height: 48px;
      background: url('../styles/img/icons_info.png') no-repeat;
    }
    .weather {
      background-position: 0 0;
    }
    .location {
      background-position: 0 -48px;
    }
    .songs {
      background-position: 0 -96px;
    }
    .manual {
      background-position: 0 -108px;
    }
  }
}
</style>
