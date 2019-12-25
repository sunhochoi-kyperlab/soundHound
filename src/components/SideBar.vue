<template>
  <div class="side-bar">
    <nav>
      <ul class="buttons">
        <li class="button back-btn" @click="onBack"></li>
        <li class="button home-btn" @click="onHome"></li>
      </ul>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'SideBar',
  data () {
    return {
      hardkeyCodes: this.$hardkey.getCodes()
    }
  },
  mounted () {
    this.initHardKeyAction()
  },
  methods: {
    initHardKeyAction () {
      this.$hardkey.addHardkeyListener(this.hardkeyCodes.code.HARDKEY_BUTTON_BACK, (e) => {
        this.onBack()
      })
    },
    onBack (evt) {
      console.log('onBack', evt)
      if (window.applicationFramework) {
        window.applicationFramework.applicationManager.getOwnerApplication(window.document).back()
      }
    },
    onHome (evt) {
      console.log('onHome', evt)
      if (window.applicationFramework) {
        window.applicationFramework.applicationManager.getOwnerApplication(window.document).main()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.side-bar {
  width: 126px;
  height: 650px;
  background: url('../styles/img/gnb_bg.png') no-repeat;
  .buttons {
    height: 650px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .button {
    width: 100%;
    height: 100px;
    display: block;
    background: url('../styles/img/ico_gnb.png') no-repeat;
  }
  .button.back-btn {
    background-position: 0 0;
    margin-top:10px;
  }
  .button.back-btn:active {
    background-position: -126px 0;
  }
  .button.home-btn {
    background-position: 0 -100px;
    margin-bottom:17px;
  }
  .button.home-btn:active {
    background-position: -126px -100px;
  }
}
</style>
