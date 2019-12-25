/**
 * Client-side(Obigo) implementation for Houndify API
 */

import { VOICE_CHROME } from '@/js/defines'
import router from '@/router'
import { Geo } from '@/js/utils'

const LOG_TAG = '[Obigo]'

// initial state
const state = {
  /* JSON */ obgReqInfo: {
    UserID: 'benjamin.kim@obigo.com',
    UnitPreference: 'METRIC',
    Latitude: 0,
    Longitude: 0,
    ResponseAudioVoice: 'Richard',
    ResponseAudioShortOrLong: 'Short'
  },
  responseJson: {
    AllResults: []
  }
}

// getters
const getters = {
  results (state) {
    return state.responseJson.AllResults[0]
  }
}

// actions
const actions = {
  parseLocalSearchCommand ({state}, response) {
    router.push({name: 'POI', params: {queryId: response.QueryID}})
  },
  parseInformationCommand ({dispatch, state}, response) {
    const info = state.responseJson.AllResults[0].InformationNuggets[0]
    switch (info.NuggetKind) {
      case 'Weather': // Weather
        router.push({name: 'Weather', params: {queryId: response.QueryID}})
        break
      case 'Wikipedia': // Wikipedia
        router.push({name: 'Wikipedia', params: {queryId: response.QueryID}})
        break
      default:
        console.warn(LOG_TAG, 'NuggetKind not handled yet:', info.NuggetKind)
        dispatch('onError', {origin: info.NuggetKind, queryId: response.QueryID})
    }
  },
  onResponse ({commit, dispatch}, data) {
    if (data.response.AllResults && data.response.AllResults.length) {
      // Store ALL
      commit('UPDATE_RESPONSE_JSON', data.response)
      // Directive Parser
      console.log(LOG_TAG, 'queryId:', data.response.QueryID)
      let commandKind = data.response.AllResults[0].CommandKind
      console.log(LOG_TAG, '_houndify_', commandKind)
      switch (commandKind) {
        case 'MusicCommand': // Music
          dispatch('audioPlayer/parseMusicCommand', data.response, {root: true})
          break
        case 'LocalSearchCommand': // POI
          dispatch('parseLocalSearchCommand', data.response)
          break
        case 'InformationCommand': // Information (Houndify Command 변경 대응, 20190925)
          dispatch('parseInformationCommand', data.response)
          break
        case 'NoResultCommand': // Didn't get that!
          console.warn(LOG_TAG, `Didn't get that!`)
          dispatch('onError', {origin: commandKind, queryId: data.response.QueryID})
          break
        default:
          console.warn(LOG_TAG, 'CommandKind not handled yet:', commandKind)
          dispatch('onError', {origin: commandKind, queryId: data.response.QueryID})
      }
    } else {
      console.error(LOG_TAG, 'Invalid directive')
      return
    }
  },
  onError ({dispatch}, data /* {origin, errorData, queryId(optional)} */) {
    console.warn(LOG_TAG, 'onError origin:', data.origin)
    console.log(LOG_TAG, 'errorData:', data.errorData)
    // Voice Chrome state - Error
    dispatch('voiceChrome/onVoiceChromeUpdate', VOICE_CHROME.ERROR, {root: true})
    // Display Card - Fallback
    let _queryId = data.origin
    if (data.queryId) {
      _queryId = data.queryId
    }
    router.push({
      name: 'Fallback',
      params: {queryId: _queryId, fallbackType: data.origin}
    })
  },
  updateGpsPosition ({commit}) {
    Geo.getCurrentPosition('DUMMY').then((position) => {
      let coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }
      commit('UPDATE_GPS_POSITION', coords)
    })
  },
  initializeOwapi ({dispatch}) {
    setTimeout(() => {
      console.log('[OWAPI] FAKE_SUCCESS')
      // Fetch GPS here
      dispatch('updateGpsPosition')
    })
    // Set GPS Interval
    setInterval(() => {
      dispatch('updateGpsPosition')
    }, 30000)
  }
}

// mutations
const mutations = {
  UPDATE_RESPONSE_JSON (state, json) {
    state.responseJson = json
  },
  UPDATE_GPS_POSITION (state, coords) {
    state.obgReqInfo.Latitude = coords.latitude
    state.obgReqInfo.Longitude = coords.longitude
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
