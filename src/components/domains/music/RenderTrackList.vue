<template>
  <obg-list :hideDummyItem="true">
    <obg-list-item
      class="large"
      :class="{playing: currentIndex === index}"
      v-for="(track, index) in trackList"
      :key="index"
      @click="onClickTrack(index)">
      <div class="head">
        <i class="icon"></i>
      </div>
      <div class="content">
        <p>{{track.TemplateData.Title}}</p>
        <p>{{track.TemplateData.Subtitle}} . {{track.TemplateData.BodyText}}</p>
      </div>
    </obg-list-item>
  </obg-list>
</template>

<script>
import ObgList from 'obigo-js-ui/components/list/List'
import ObgListItem from 'obigo-js-ui/components/list/list-item'
import { mapState } from 'vuex'

export default {
  name: 'RenderTrackList',
  components: {
    'obg-list': ObgList,
    'obg-list-item': ObgListItem
  },
  computed: {
    ...mapState({
      trackList: (state) => state.audioPlayer.trackList,
      currentIndex: (state) => state.audioPlayer.currentTrackIndex
    })
  },
  methods: {
    onClickTrack (index) {
      this.$store.dispatch('audioPlayer/setCurrentTrack', index)
    }
  }
}
</script>

<style lang="scss" scoped>
.obg-list {
  width: 577px !important;
  height: 100%;
  border-left: 1px solid #31345f;
  align-items: center;
  .obg-list-item {
    background: transparent;
    height: 130px;
    border-bottom: 1px solid #31345f;
    &:before {
      left: 0;
      width: 100%;
      background: #5e5e5e;
      display: none;
    }
    .head {
      margin-left: -2px;
      margin-left: -1px;
      .icon {
        display: block;
        width: 40px;
        height: 40px;
        background: url('../../../styles/img/icon_music.png') no-repeat -40px 0;
        margin-right: 35px;
        &::first-child{
            margin-left: 50px;
        }
      }
      + .content {
        margin: 0;
      }
    }
    .content {
      p {
        width: 450px;
        max-height: 100%;
        font-size: 33px;
        line-height: 150%;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        flex: initial;
        &:last-child {
          font-size: 27px;
        }
      }
    }
    &.playing {
      .head {
        .icon {
          background-position: 0 0;
        }
      }
      p {
        color: #00b1fb !important;
      }
    }
    &:active {
      background: #3a3d60;
      .content {
        p {
          &:last-child {
            color: #ffffff;
          }
        }
      }
    }
  }
}
</style>
