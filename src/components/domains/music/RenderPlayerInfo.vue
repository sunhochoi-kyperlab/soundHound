<template>
  <div class="player-info">
    <div class="player-cover">
      <img src="@/styles/img/cover.png" alt="">
    </div>
    <div class="player-contents">
      <p class="song-title">{{playerInfo.Title}}</p>
      <p class="song-info">{{playerInfo.Subtitle}} . {{playerInfo.BodyText}}</p>
    </div>
    <div class="player-controls">
      <button class="my-icon step-backward" @click="onClickPrev"></button>
      <button v-show="!isPlaying" class="my-icon play" @click="onClickPlay"></button>
      <button v-show="isPlaying" class="my-icon pause" @click="onClickPause"></button>
      <button class="my-icon step-forward" @click="onClickNext"></button>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'RenderPlayerInfo',
  computed: {
    ...mapState({
      isPlaying: (state) => state.audioPlayer.isPlaying
    }),
    ...mapGetters({
      playerInfo: 'audioPlayer/currentTrackInfo'
    })
  },
  methods: {
    onClickPrev () {
      this.$store.dispatch('audioPlayer/onPreviousCommandIssued')
    },
    onClickPlay () {
      this.$store.dispatch('audioPlayer/onPlayCommandIssued')
    },
    onClickPause () {
      this.$store.dispatch('audioPlayer/onPauseCommandIssued')
    },
    onClickNext () {
      this.$store.dispatch('audioPlayer/onNextCommandIssued')
    }
  }
}
</script>

<style lang="scss" scoped>
.player-info {
//   min-height: 122px;
  width: 577px;
  display: flex;
  border-bottom: 1px solid #5e5e5e;
  flex-direction: column;
  align-items: center;
  .player-controls {
    width: 305px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 32px;
    .my-icon {
      display: block;
      background: url('../../../styles/img/player/icon_playlist.png') no-repeat;
      width: 80px;
      height: 80px;
    }
  }
  .player-contents {
    overflow: hidden;
    text-align: center;
    .song-title {
      font-size: 40px;
      line-height: 130%;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      margin-top: 35px;
    }
    .song-info {
      font-size: 26px;
      line-height: 160%;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      color: #969696;
    } 
  }  
  .player-cover {
    width: 180px;
    height: 180px;
    overflow: hidden;
    align-self: center;
    margin: 44px 0 0;
    img{
        display: block;
        width: 100%;
        height: 100%;
    }
  }   
}
.step-backward {
  background-position: 0 -160px;
  &:active{
    background-position: -80px -160px;
  }
}
.play {
  background-position: 0 0;
  &:active{
    background-position: -80px 0;
  }
}
.pause {
  background-position: 0 -80px;
  &:active{
    background-position: -80px -80px;
  }
}
.step-forward {
  background-position: 0 -240px;
  &:active{
    background-position: -80px -240px;
  }
}
</style>
