<template>
  <div v-if="musicTemplateType === 'Tracks'" class="response-area">
    <!-- <div class="response-text" >
      <p>{{responseText}}</p>
    </div> -->
    <render-player-info></render-player-info>
    <render-track-list></render-track-list>
  </div>
  <div v-else>
    <div class="fallback-card">
      <p class="main-text">{{responseText}}</p>
      <p class="sub-text">- Music Search -</p>
    </div>
  </div>
</template>

<script>
import RenderPlayerInfo from './RenderPlayerInfo.vue'
import RenderTrackList from './RenderTrackList.vue'
import { mapState } from 'vuex'

export default {
  name: 'MusicTemplate',
   props: [
    'musicTemplateType'
  ],
  components: {
    'render-player-info': RenderPlayerInfo,
    'render-track-list': RenderTrackList
  },
  computed: {
    ...mapState({
      responseText: (state) => state.audioPlayer.responseText
    })
  },
  created () {
    console.log(this.$options.name, 'results:', this.results)
  }
}
</script>

<style lang="scss" scoped>
.response-area {
  flex-direction: row;
}
</style>
