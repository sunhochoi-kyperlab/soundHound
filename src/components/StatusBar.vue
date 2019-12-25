<template>
  <div class="status-bar">
    <div class="app-info">
      <div class="app-icon"></div>
      <span class="app-name">{{appName}}</span>
    </div>
    <div class="clock">
      <span class="month">{{month}}</span>
      <span class="date">{{date}}</span>
      <span class="time">{{time}}</span>
      <span class="ampm">{{ampm}}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatusBar',
  data () {
    return {
      monthValues: {
        abbreviated: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      },
      appName: 'My Assistant',
      month: '',
      date: '',
      time: '',
      ampm: ''
    }
  },
  created () {
    this.updateClock()
    this.timer = setInterval(this.updateClock, 60000)
  },
  beforeDestroy () {
    clearInterval(this.timer)
  },
  methods: {
    formatAMPM (date) {
      return date.getHours() >= 12 ? 'pm' : 'am'
    },
    updateClock () {
      const d = new Date()
      console.log('tick-tock =>', d)
      this.month = this.monthValues.abbreviated[d.getMonth()]
      this.date = d.getDate()
      this.time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      this.ampm = this.formatAMPM(d)
    }
  }
}
</script>

<style lang="scss" scoped>
@font-face {
  font-family: 'Roboto-Light';
  src: url('../styles/font/Roboto-Light-webfont.woff') format('woff');
}
.status-bar {
  width: 2560px;
  height: 70px;
  background-color: #141416;
  display: flex;
  justify-content: center;
}
.app-info {
  display: flex;
  align-self: center;
  position: absolute;
  left: 29px;
  .app-icon {
    width: 16px;
    height: 24px;
    background-image: url('../styles/img/-e-houdify-icon.png');
  }
  .app-name {
    color: #aaaaaa;
    font-size: 26.5px;
    margin-left: 11px;
  }
}
.clock {
  color: #ffffff;
  align-self: center;
  font-size: 27px;
  letter-spacing: -0.68px;
  font-family: 'Roboto-Light';
  .month {
    color: #7a7a7a;
    margin-left: 2px;
    font-family: inherit;
  }
  .date {
    color: #7a7a7a;
    margin-left: 8px;
    font-family: inherit;
  }
  .time {
    font-size: 37px;
    letter-spacing: -0.93px;
    margin-left: 18px;
    font-family: inherit;
  }
  .ampm {
    margin-left: -1px;
    font-family: inherit;
  }
}
</style>
