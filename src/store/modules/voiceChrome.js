/**
 * Voice Chrome
 */

import { VOICE_CHROME } from '@/js/defines'

const LOG_TAG = '[VoiceChrome]'

// initial state
const state = {
  /* String */ voiceChromeState: VOICE_CHROME.IDLE,
  /* JSON */ transcript: {
    PartialTranscript: ''
  },
  /* Boolean */ bypassUpdate: false,
  errorTimeoutId: null
}

// getters
const getters = {
  voiceChromeStateCSS (state) {
    switch (state.voiceChromeState) {
      case VOICE_CHROME.IDLE:
        return 'idle'
      case VOICE_CHROME.LOCAL_LISTENING:
      case VOICE_CHROME.LISTENING:
        return 'listening'
      case VOICE_CHROME.STOP_LISTENING:
      case VOICE_CHROME.THINKING:
        return 'thinking'
      case VOICE_CHROME.SPEAKING:
        return 'speaking'
      case VOICE_CHROME.ERROR:
        return 'error'
    }
  },
  voiceChromeSize (_) {
    return 'big'
  },
  voiceChromeText (state) {
    switch (state.voiceChromeState) {
      case VOICE_CHROME.IDLE:
        return 'What can I do for you?'
      case VOICE_CHROME.LOCAL_LISTENING:
        return 'Listening'
      case VOICE_CHROME.LISTENING:
        return 'Listening...'
      case VOICE_CHROME.STOP_LISTENING:
      case VOICE_CHROME.THINKING:
        return 'Thinking...'
      case VOICE_CHROME.SPEAKING:
        return 'Speaking...'
      case VOICE_CHROME.ERROR:
        return 'Oops!\nSomething went wrong'
    }
  },
  transcript (state) {
    return state.transcript.PartialTranscript
  }
}

// actions
const actions = {
  onVoiceChromeUpdate ({commit, dispatch, state}, data) {
    // console.log(LOG_TAG + ' onVoiceChromeUpdate called: ' + data)
    if (state.bypassUpdate) {
      console.log(LOG_TAG, 'bypass', data)
      return
    }
    switch (data) {
      case VOICE_CHROME.IDLE:
        commit('UPDATE_VC_IDLE')
        break
      case VOICE_CHROME.LOCAL_LISTENING:
        commit('UPDATE_VC_LOCAL_LISTENING')
        break
      case VOICE_CHROME.LISTENING:
        commit('UPDATE_VC_LISTENING')
        setTimeout(() => {
          if (state.transcript.PartialTranscript && state.transcript.PartialTranscript.length < 1) {
            console.log(LOG_TAG, 'no mic input for 5 secs => reset')
            dispatch('vpa/resetVoiceChrome', {redirect: true}, {root: true})
          }
        }, 5000)
        break
      case VOICE_CHROME.STOP_LISTENING:
        if (state.voiceChromeState !== VOICE_CHROME.THINKING) {
          commit('UPDATE_VC_STOP_LISTENING')
        }
        break
      case VOICE_CHROME.THINKING:
        commit('UPDATE_VC_THINKING')
        break
      case VOICE_CHROME.SPEAKING:
        commit('UPDATE_VC_SPEAKING')
        break
      case VOICE_CHROME.ERROR:
        commit('UPDATE_VC_ERROR')
        commit('BYPASS_VOICE_CHROME_UPDATE', true)
        const _errorTimeoutId = setTimeout(() => {
          commit('BYPASS_VOICE_CHROME_UPDATE', false)
          dispatch('vpa/resetVoiceChrome', {redirect: true}, {root: true})
        }, 5000)
        commit('SET_ERROR_TIMEOUT', _errorTimeoutId)
        break
      default:
        console.warn(LOG_TAG, 'Invalid data from VPA:', data)
    }
  },
  onTranscriptionUpdate ({commit}, data) {
    // console.log(LOG_TAG + ' onTranscriptionUpdate called: ' + data)
    commit('UPDATE_TRANSCRIPT', data)
  }
}

// mutations
const mutations = {
  UPDATE_VC_IDLE (state) {
    state.voiceChromeState = VOICE_CHROME.IDLE
  },
  UPDATE_VC_LOCAL_LISTENING (state) {
    state.voiceChromeState = VOICE_CHROME.LOCAL_LISTENING
  },
  UPDATE_VC_LISTENING (state) {
    state.voiceChromeState = VOICE_CHROME.LISTENING
  },
  UPDATE_VC_STOP_LISTENING (state) {
    state.voiceChromeState = VOICE_CHROME.STOP_LISTENING
  },
  UPDATE_VC_THINKING (state) {
    state.voiceChromeState = VOICE_CHROME.THINKING
  },
  UPDATE_VC_SPEAKING (state) {
    state.voiceChromeState = VOICE_CHROME.SPEAKING
  },
  UPDATE_VC_ERROR (state) {
    state.voiceChromeState = VOICE_CHROME.ERROR
  },
  UPDATE_TRANSCRIPT (state, transcript) {
    state.transcript = transcript
  },
  BYPASS_VOICE_CHROME_UPDATE (state, boolean) {
    state.bypassUpdate = boolean
  },
  SET_ERROR_TIMEOUT (state, errorTimeoutId) {
    state.errorTimeoutId = errorTimeoutId
  },
  CLEAR_ERROR_TIMEOUT (state) {
    state.bypassUpdate = false
    if (state.errorTimeoutId) {
      clearTimeout(state.errorTimeoutId)
    }
    state.errorTimeoutId = null
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
