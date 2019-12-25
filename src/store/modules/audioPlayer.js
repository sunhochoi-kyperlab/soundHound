import router from '@/router'
import { VOICE_CHROME } from '@/js/defines'
// import { deepCopy } from '@/store/util/utils'

const LOG_TAG = '[AudioPlayer]'

// initial state
const state = {
  responseText: '',
  trackList: [{
    TemplateData: {}
  }],
  currentTrackIndex: 0,
  audioObject: null,
  isPlaying: false
}

// getters
const getters = {
  currentTrackInfo (state) {
    return state.trackList[state.currentTrackIndex].TemplateData
  }
}

// actions
const actions = {
  onPlayCommandIssued ({commit, state}) {
    if (state.audioObject) {
      state.audioObject.play()
      commit('UPDATE_IS_PLAYING', true)
    } else {
      console.log(LOG_TAG, 'onPlayCommandIssued but audioObject is null')
    }
  },
  onPauseCommandIssued ({commit, state}) {
    if (state.audioObject) {
      state.audioObject.pause()
      commit('UPDATE_IS_PLAYING', false)
    }
  },
  onNextCommandIssued ({dispatch, state}) {
    let newIndex = 0
    if (state.currentTrackIndex < state.trackList.length - 1) {
      newIndex = state.currentTrackIndex + 1
    }
    dispatch('setCurrentTrack', newIndex)
  },
  onPreviousCommandIssued ({dispatch, state}) {
    let newIndex = state.trackList.length - 1
    if (state.currentTrackIndex !== 0) {
      newIndex = state.currentTrackIndex - 1
    }
    dispatch('setCurrentTrack', newIndex)
  },
  setCurrentTrack ({commit, dispatch, state, rootState}, index) {
    if (state.audioObject) state.audioObject.pause()

    commit('SET_CURRENT_TRACK', index) // also new Audio() here
    setTimeout(() => {
      state.audioObject.oncanplay = () => {
        console.log(LOG_TAG, 'audioObject canplay event')
        if (rootState.voiceChrome.voiceChromeState === VOICE_CHROME.SPEAKING) {
          console.log(LOG_TAG, 'ttsAudio current focused, discard auto-play')
        } else {
          dispatch('onPlayCommandIssued')
        }
      }
      state.audioObject.onplay = () => {
        console.log(LOG_TAG, 'audioObject play event')
      }
      state.audioObject.onpause = () => {
        console.log(LOG_TAG, 'audioObject pause event')
      }
      state.audioObject.onended = () => {
        console.log(LOG_TAG, 'audioObject ended event')
        dispatch('onNextCommandIssued')
      }
    })
  },
  parseMusicCommand ({commit, dispatch, state}, response) {
    console.log(LOG_TAG, 'parseMusicCommand', response)

    const _results = response.AllResults[0]
    const _musicTemplateType = _results.TemplateData.Items[0].TemplateData.Title
    const _userRequestedAutoPlay = _results.NativeData.UserRequestedAutoPlay

    /**
     * who is michael jackson => Here is the music artist Michael Jackson.
     * play michael jackson => Auto-playback is not available. Here are some of the top songs by Michael Jackson.
     * find michael jackson songs => Here are some of the top songs by Michael Jackson.
     */
    let responseText = _results.SpokenResponseLong // NOT SpokenResponse
    let responseAudioBytes = _results.ResponseAudioBytes

    /**
     * Change SpokenResponse when UserRequestedAutoPlay
     * play michael jackson => Auto-playback is not available. Here are some of the top songs by Michael Jackson.
     * => Playing Love Never Felt so Good by Michael Jackson.
     */
    if (_musicTemplateType === 'Tracks' && _userRequestedAutoPlay) {
      console.log(LOG_TAG, 'UserRequestedAutoPlay')
      responseText = _results.AutoPlayPreviewResult.SpokenResponse // AutoPlayGenericResult?
      responseAudioBytes = _results.AutoPlayPreviewResult.ResponseAudioBytes
    } else {
      console.warn(LOG_TAG, 'AutoPlay not available')
    }

    commit('UPDATE_RESPONSE_TEXT', responseText)

    // PLAY_TTS
    dispatch('vpa/playTTS', {audioBytes: responseAudioBytes}, {root: true})
      .then(() => {
        console.log(LOG_TAG, 'ttsAudio ended promise')
        if (_userRequestedAutoPlay) {
          dispatch('onPlayCommandIssued')
        }
      })

    if (_musicTemplateType === 'Tracks') {
      // TemplateData to Track List
      commit('SET_TRACK_LIST', _results.TemplateData.Items)
      dispatch('setCurrentTrack', 0)
    }

    router.push({name: 'MusicTemplate', params: {queryId: response.QueryID, musicTemplateType: _musicTemplateType}})
  },
  destroy ({commit, dispatch}) {
    dispatch('onPauseCommandIssued')
    commit('DESTROY')
  }
}

// mutations
const mutations = {
  UPDATE_RESPONSE_TEXT (state, responseText) {
    state.responseText = responseText
  },
  SET_TRACK_LIST (state, trackList) {
    state.trackList = trackList
    state.trackList.shift()
    state.trackList = state.trackList.slice(0, 9)
  },
  SET_CURRENT_TRACK (state, index) {
    state.currentTrackIndex = index
    state.audioObject = new Audio(state.trackList[index].TemplateData.AudioPreviewURI)
  },
  UPDATE_IS_PLAYING (state, boolean) {
    state.isPlaying = boolean
  },
  DESTROY (state) {
    state.audioObject = null
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
