const LOG_TAG = '[WebAudio]'

// state
export const NATIVE_AUDIO_SOURCE_STATUS_OFF = 0
export const NATIVE_AUDIO_SOURCE_STATUS_ON = 1
export const NATIVE_AUDIO_SOURCE_STATUS_PAUSE = 2

// sourceType
export const AUDIO_SOURCE_MAIN = 0
export const AUDIO_SOURCE_USER_INTERRUPTION = 1
export const AUDIO_SOURCE_SYSTEM_INTERRUPTION = 2
export const AUDIO_SOURCE_MIX = 3
export const AUDIO_SOURCE_SPEECH = 4

let instance
class WebAudio {
  constructor () {
    if (instance) return instance
    this.timer = 0
    this.audioFocusState = null
    // WebAudio v0.3.0
    if (window.applicationFramework) {
      window.applicationFramework.audioManager.addEventListener(
        'AudioFocusChanged',
        (state, sourceType, description) => {
          console.warn(LOG_TAG, `AudioFocusChanged => state: ${state}, sourceType: ${sourceType}, description: ${description}`)
          /**
           * Android AudioManager의 terms를 사용하여 구현
           * https://developer.android.com/guide/topics/media-apps/audio-focus
           */
          if (sourceType === AUDIO_SOURCE_SPEECH) {
            switch (state) {
              case NATIVE_AUDIO_SOURCE_STATUS_OFF:
                this.audioFocusState = 'AUDIOFOCUS_LOSS'
                break
              case NATIVE_AUDIO_SOURCE_STATUS_ON:
                this.audioFocusState = 'AUDIOFOCUS_GAIN'
                break
              case NATIVE_AUDIO_SOURCE_STATUS_PAUSE:
                this.audioFocusState = 'AUDIOFOCUS_LOSS_PAUSE'
                break
              default:
                console.error(LOG_TAG, 'invalid AudioFocus state:', state)
            }
          } else {
            console.log(LOG_TAG, `sourceType: ${sourceType} is not relevant to VPA`)
          }
        }
      )
    }
    // deprecated (WebAudio v0.2.4)
    // window.navigator.mediaDevices.onaudiofocuschange = (changeInfo) => {
    //   console.warn(LOG_TAG, 'onaudiofocuschange', changeInfo)
    //   if (changeInfo.state === changeInfo.AUDIO_FOCUS_GAIN) {
    //     console.log(LOG_TAG, 'AUDIO_FOCUS_GAIN:', changeInfo.state)
    //     this.audioFocusState = 'AUDIO_FOCUS_GAIN'
    //   } else if (changeInfo.state === changeInfo.AUDIO_FOCUS_LOSS) {
    //     console.log(LOG_TAG, 'AUDIO_FOCUS_LOSS:', changeInfo.state)
    //     this.audioFocusState = 'AUDIO_FOCUS_LOSS'
    //   } else if (changeInfo.state === changeInfo.AUDIO_FOCUS_ERROR) {
    //     console.log(LOG_TAG, 'AUDIO_FOCUS_ERROR:', changeInfo.state)
    //     this.audioFocusState = 'AUDIO_FOCUS_ERROR'
    //   }
    // }
    instance = this
  }
  requestAudioFocus () {
    return new Promise((resolve, reject) => {
      console.log(LOG_TAG, 'requestAudioFocus called')
      if (!window.applicationFramework) {
        console.log(LOG_TAG, 'requestAudioFocus FAKE_SUCCESS')
        resolve()
      } else {
        // WebAudio v0.3.0
        window.applicationFramework.audioManager.requestAudioFocus(AUDIO_SOURCE_SPEECH)
        let retryCount = 0
        const intervalId = setInterval(() => {
          if (this.audioFocusState === 'AUDIOFOCUS_GAIN') {
            clearInterval(intervalId)
            resolve()
          } else {
            retryCount++
            console.log(LOG_TAG, 'allocating... retryCount:', retryCount)
            if (retryCount > 20) {
              console.error(LOG_TAG, 'requestAudioFocus failed')
              clearInterval(intervalId)
              reject()
            }
          }
        }, 100)
      }
      // deprecated (WebAudio v0.2.4)
      // window.navigator.mediaDevices.requestAudioFocus()
      // const intervalId = setInterval(() => {
      //   if (this.audioFocusState === 'AUDIO_FOCUS_GAIN') {
      //     clearInterval(intervalId)
      //     resolve()
      //   } else {
      //     console.log(LOG_TAG, 'allocating...')
      //   }
      // }, 100)
    })
  }
  releaseAudioFocus () {
    return new Promise((resolve, reject) => {
      console.log(LOG_TAG, 'abandonAudioFocus called')
      if (!window.applicationFramework) {
        console.log(LOG_TAG, 'abandonAudioFocus FAKE_SUCCESS')
        resolve()
      } else {
        // WebAudio v0.3.0
        window.applicationFramework.audioManager.abandonAudioFocus(AUDIO_SOURCE_SPEECH)
        let retryCount = 0
        const intervalId = setInterval(() => {
          if (this.audioFocusState === 'AUDIOFOCUS_LOSS') {
            clearInterval(intervalId)
            resolve()
          } else {
            retryCount++
            console.log(LOG_TAG, 'deallocating... retryCount:', retryCount)
            if (retryCount > 20) {
              console.error(LOG_TAG, 'abandonAudioFocus failed')
              clearInterval(intervalId)
              reject()
            }
          }
        }, 100)
      }
      // deprecated (WebAudio v0.2.4)
      // window.navigator.mediaDevices.releaseAudioFocus()
      // // AUDIO_FOCUS_LOSS가 발생하지 않는다, 그래서 그냥 setTimeout후 resolve
      // const timeoutId = setTimeout(() => {
      //   clearTimeout(timeoutId)
      //   resolve()
      // }, 100)
    })
  }
}
export default WebAudio
