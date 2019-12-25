import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from './util/logger'
import audioPlayer from './modules/audioPlayer'
import obigo from './modules/obigo'
import voiceChrome from './modules/voiceChrome'
import vpa from './modules/vpa'

Vue.use(Vuex)

// const debug = process.env.NODE_ENV !== 'production'
const debug = false

const store = new Vuex.Store({
  modules: {
    audioPlayer,
    obigo,
    voiceChrome,
    vpa
  },
  strict: debug,
  plugins: debug ? [createLogger()] : []
})

export default store
