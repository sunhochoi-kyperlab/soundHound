/**
 * Virtual Personal Assistant
 */

import { VOICE_CHROME } from '@/js/defines'
import { VPA } from '@/api'
import router from '@/router'

const LOG_TAG = '[VPA]'

// initial state
const state = {
  //
}

// getters
const getters = {
  //
}

// actions
const actions = {
  initialize ({dispatch}) {
    // VPA subscriptions
    VPA.subscribe('onVoiceChromeUpdate', (data) => {
      dispatch('voiceChrome/onVoiceChromeUpdate', data, {root: true})
    })
    VPA.subscribe('onTranscriptionUpdate', (data) => {
      dispatch('voiceChrome/onTranscriptionUpdate', data, {root: true})
    })
    VPA.subscribe('onResponse', (data) => {
      dispatch('obigo/onResponse', data, {root: true})
    })
    VPA.subscribe('onError', (data /* {origin, errorData} */) => {
      dispatch('obigo/onError', data, {root: true})
    })
    // Construct ObigoWebAPI
    dispatch('obigo/initializeOwapi', null, {root: true})
  },
  handleVoiceChrome ({dispatch, rootState}) {
    dispatch('audioPlayer/onPauseCommandIssued', null, {root: true})
    switch (rootState.voiceChrome.voiceChromeState) {
      case VOICE_CHROME.IDLE:
        VPA.startRecording({requestInfo: rootState.obigo.obgReqInfo})
        break
      case VOICE_CHROME.LOCAL_LISTENING:
      case VOICE_CHROME.LISTENING:
        // VPA.stopListening()
        console.warn(LOG_TAG, 'Block outgoing vc event when listening')
        break
      case VOICE_CHROME.STOP_LISTENING:
      case VOICE_CHROME.THINKING:
        // VPA.stopThinking()
        console.warn(LOG_TAG, 'Block outgoing vc event when thinking')
        break
      case VOICE_CHROME.SPEAKING:
        // 1-5. Screen Spec.에 따라 Speaking에서 VC 클릭시 Listening
        dispatch('resetVoiceChrome', {redirect: false}).then(() => {
          // resetVoiceChrome => stopSpeaking => releaseAudioFocus => startRecording
          console.log(LOG_TAG, 'resetVoiceChrome resolved')
          VPA.startRecording({requestInfo: rootState.obigo.obgReqInfo})
        })
        break
      case VOICE_CHROME.ERROR:
        console.warn(LOG_TAG, 'Block outgoing vc event when error')
        break
      default:
        console.warn(LOG_TAG, 'Invalid voiceChromeState:', rootState.voiceChrome.voiceChromeState)
    }
  },
  playTTS (_, /* {audioBytes, text} */ payload) {
    return new Promise((resolve, reject) => {
      VPA.playTTS(payload).then(() => {
        resolve()
      })
    })
  },
  resetVoiceChrome ({commit, dispatch, rootState}, /* {redirect} */ payload) {
    return new Promise((resolve, reject) => {
      console.log(LOG_TAG, 'resetVoiceChrome called')
      switch (rootState.voiceChrome.voiceChromeState) {
        case VOICE_CHROME.LISTENING:
          VPA.stopListening()
          break
        case VOICE_CHROME.THINKING:
          VPA.stopThinking()
          break
        case VOICE_CHROME.SPEAKING:
          VPA.stopSpeaking().then(() => {
            console.log(LOG_TAG, 'stopSpeaking resolved')
            resolve()
          })
          break
        case VOICE_CHROME.ERROR:
          console.log(LOG_TAG, 'reset vc from error')
          commit('voiceChrome/CLEAR_ERROR_TIMEOUT', null, {root: true})
          VPA.destroyTTS()
          break
      }
      dispatch('audioPlayer/destroy', null, {root: true})
      dispatch('voiceChrome/onVoiceChromeUpdate', VOICE_CHROME.IDLE, {root: true})
      dispatch('voiceChrome/onTranscriptionUpdate', '', {root: true})
      if (payload.redirect) {
        router.push('/')
      }
    })
  }
}

// mutations
const mutations = {
  //
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
