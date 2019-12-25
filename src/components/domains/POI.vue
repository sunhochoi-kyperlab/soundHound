<template>
  <div v-if="locationSupported" class="response-area">
    <!-- <div class="response-text">
      <p>{{results.SpokenResponse}}</p>
    </div> -->
    <obg-list ref="scrollContainer" :hideDummyItem="true">
      <obg-list-item v-for="(item, index) in poiList" :key="index" @click="navigateToClicked(item)">
        <div class="thumb-img">
          <img :src="getImage(index)" draggable="false"/>
        </div>
        <div class="head">
          <p class="order">{{index + 1}}</p>
        </div>
        <div class="content">
          <p>{{item.Name}}</p>
          <p>{{item.Location.Address}}</p>
        </div>
        <div class="tail">
          <div class="point"><span :class="getRating(index)"></span></div>
        </div>
      </obg-list-item>
    </obg-list>
  </div>
  <div v-else>
    <div class="fallback-card">
      <p class="main-text">{{results.SpokenResponse}}</p>
    </div>    
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ObgList from 'obigo-js-ui/components/list/List'
import ObgListItem from 'obigo-js-ui/components/list/list-item'
import popup from 'obigo-js-ui/components/popup'

export default {
  name: 'POI',
  components: {
    'obg-list': ObgList,
    'obg-list-item': ObgListItem
  },
  data () {
    return {
      poiList: null,
      ratingList: null,
      locationSupported: true
    }
  },
  computed: {
    ...mapGetters({
      results: 'obigo/results'
    })
  },
  created () {
    console.log(this.$options.name, 'results:', this.results)

    if (this.results.NativeData.LocationNotSupported) {
      console.log(this.$options.name, 'LocationNotSupported')
      this.locationSupported = false
    }

    if (this.results.TemplateData) {
      this.poiList = this.results.NativeData.LocalResults.slice(0, 6)
      this.ratingList = this.results.TemplateData.Items
    }

    // PLAY_TTS
    this.$store.dispatch('vpa/playTTS', {audioBytes: this.results.ResponseAudioBytes})
  },
  methods: {
    // Removed feature
    // getDistance (item) {
    //   if (item.DistanceFromUser) {
    //     return Number(item.DistanceFromUser.Value).toFixed(1)
    //   }
    //   return 1
    // },
    getImage (index) {
      return this.ratingList[index].TemplateData.Image ? this.ratingList[index].TemplateData.Image.URL : null
    },
    getRating (index) {
      return `star-${this.ratingList[index].TemplateData.Rating ? this.ratingList[index].TemplateData.Rating.toFixed(0) : 0}`
    },
    showTwoButtonsPopup ({title, content, confirm, cancel, confirmButtonName = 'OK', cancelButtonName = 'Cancel'}) {
      const _twoButtons = popup.show({
        title,
        content,
        buttons: [
          {
            label: confirmButtonName,
            onClick () {
              confirm()
              _twoButtons.close()
            }
          },
          {
            label: cancelButtonName,
            onClick () {
              cancel()
              _twoButtons.close()
            }
          }
        ]
      })
    },
    navigateToClicked (item) {
      console.log(this.$options.name, 'navigateToClicked')
      this.showTwoButtonsPopup({
        title: '',
        content: 'Would you like to navigate to this location?',
        confirm () {
          console.log('popupConfirmClicked')
        },
        cancel () {
          console.log('popupCancelClicked')
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.response-area{
    flex-direction: column;
}
.obg-list {
  height: 100%;
  .obg-list-item {
    background: transparent;
    height: 130px;
    border-bottom: 1px solid #31345f;
    align-items: center;
    &:before {
      left: 0;
      width: 100%;
      background: #5e5e5e;
      display: none;
    }
    &:active {
      background: #0054a8;
    }
    .thumb-img {
      -webkit-mask-image: linear-gradient(to right, transparent 25%, black 75%);
      mask-image: linear-gradient(to right, transparent 25%, black 75%);
      position: absolute;
      right: 0;
      width: 450px;
      height: 100%;
      overflow: hidden;
      display: none;
      align-items: center;
      img {
        display: block;
        width: 100%;
        height: auto;
        background-size: cover;
      }
    }
    .head {
      margin: 0 29px 0 44px;
      .order {
        margin-left: 0;
        width: 50px;
        font-size: 33px;
        text-align: center;
      }
      + .content {
        margin: 0;
        width: 815px;
        flex: inherit;
      }
    }
    .content {
      p {
        width: 100%;
        max-height: 100%;
        font-size: 33px;
        line-height: 150%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        &:last-child {
          width: auto;
          font-size: 27px;
        }
      }
    }
    .tail {
        margin: 0 0 0 6px;
      .point {
        width: 170px;
        height: 25px;
        background: url('../../styles/img/star.png') repeat-x;
        span {
          display: block;
          width: 0;
          height: 100%;
          background: url('../../styles/img/star.png') repeat-x 0 -25px;
        }
        .star-1 {
          width: 20%;
        }
        .star-2 {
          width: 40%;
        }
        .star-3 {
          width: 60%;
        }
        .star-4 {
          width: 80%;
        }
        .star-5 {
          width: 100%;
        }
      }
    }
  }
}
</style>
