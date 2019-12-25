import PubSub from './pubSub'
import WebAudio from './webAudio'
import HoundHelper from './houndHelper'

const LOG_TAG = '[VPA]'
let instance
class VPA {
  constructor () {
    if (instance) return instance

    this.pubSub = new PubSub()
    this.webAudio = new WebAudio()
    this.houndHelper = new HoundHelper()

    this.ttsAudio = null
    this.token = false

    instance = this
  }
  // publish (topic, data) {
  //   this.pubSub.publish(topic, data)
  // }
  subscribe (topic, handler) {
    this.pubSub.subscribe(topic, handler) // default: VPA
  }
  startRecording (payload) {
    this.houndHelper.requestInfo = payload.requestInfo
    this.webAudio.requestAudioFocus().then(() => {
      this.houndHelper.audioRecorder.start()
    }).catch(() => {
      this.pubSub.publish('onVoiceChromeUpdate', 'VOICE_CHROME_IDLE')
    })
    // loading circle notched icon big
    console.log(LOG_TAG, 'VOICE_CHROME_LOCAL_LISTENING => starting Houndify.AudioRecorder...')
    this.pubSub.publish('onVoiceChromeUpdate', 'VOICE_CHROME_LOCAL_LISTENING')
  }
  stopListening () {
    console.log(LOG_TAG, 'stopListening')
    this.houndHelper.discardResponse = true
    this.houndHelper.voiceRequest.abort()
    if (this.houndHelper.audioRecorder || this.houndHelper.audioRecorder.isRecording()) {
      this.houndHelper.audioRecorder.stop()
    }

    this.webAudio.releaseAudioFocus().then(() => {
      this.pubSub.publish('onVoiceChromeUpdate', 'VOICE_CHROME_IDLE')
    })
  }
  stopThinking () {
    console.log(LOG_TAG, 'stopThinking')
    this.houndHelper.discardResponse = true
    this.houndHelper.voiceRequest.abort()

    this.webAudio.releaseAudioFocus().then(() => {
      this.pubSub.publish('onVoiceChromeUpdate', 'VOICE_CHROME_IDLE')
    })
  }
  stopSpeaking () {
    return new Promise((resolve, reject) => {
      console.log(LOG_TAG, 'stopSpeaking')
      this.ttsAudio.pause()
      this.ttsAudio.onpause = () => {
        this.webAudio.releaseAudioFocus().then(() => {
          this.pubSub.publish('onVoiceChromeUpdate', 'VOICE_CHROME_IDLE')
          this.ttsAudio = null
          resolve()
        })
      }
    })
  }
  destroyTTS () {
    console.log(LOG_TAG, 'destroyTTS')
    this.token = false
    if (this.ttsAudio) {
      this.ttsAudio.pause()
    }
    this.webAudio.releaseAudioFocus().then(() => {
      this.ttsAudio = null
    })
  }
  abort () {
    console.log(LOG_TAG, 'aborting ongoing vpa request')

    this.houndHelper.discardResponse = true // will abort ongoing voiceRequest and discard response recevied

    if (this.houndHelper.audioRecorder || this.houndHelper.audioRecorder.isRecording()) {
      this.houndHelper.audioRecorder.stop()
      // this.houndHelper.voiceRequest.abort()
    }

    this.webAudio.releaseAudioFocus().then(() => {
      this.pubSub.publish('onVoiceChromeUpdate', 'VOICE_CHROME_IDLE')
    })
  }
  synthesizeTTS (text) {
    return new Promise((resolve, reject) => {
      console.log(LOG_TAG, 'synthesizing', text)
      let speakThis = {
        queryString: 'speak_this',
        ClientMatches: [
          {
            Expression: 'speak_this',
            Result: {
              Intent: 'speak_this'
            },
            SpokenResponse: text,
            SpokenResponseLong: text,
            WrittenResponse: text,
            WrittenResponseLong: text
          }
        ]
      }
      this.houndHelper.initTextRequest(speakThis).then((scb) => {
        console.log(LOG_TAG, 'response from TextRequest:', scb.response)
        resolve(scb.response.AllResults[0].ResponseAudioBytes)
      })
    })
  }
  prepareTTSAudio (payload) {
    return new Promise((resolve, reject) => {
      console.log(LOG_TAG, 'prepareTTSAudio called')
      if (payload.text) {
        this.synthesizeTTS(payload.text).then((synthesized) => {
          resolve(new Audio('data:audio/wav;base64, ' + synthesized, 'voice'))
        })
      } else if (payload.audioBytes) {
        resolve(new Audio('data:audio/wav;base64, ' + payload.audioBytes, 'voice'))
      }
    })
  }
  playTTS (/* {audioBytes, text} */ payload) {
    return new Promise((resolve, reject) => {
      console.log(LOG_TAG, 'playTTS called')
      this.token = true

      this.prepareTTSAudio(payload).then((_ttsAudio) => {
        this.ttsAudio = _ttsAudio

        this.ttsAudio.oncanplay = () => {
          console.log(LOG_TAG, 'ttsAudio canplay event')
          if (this.token) {
            this.ttsAudio.play()
          } else {
            console.log(LOG_TAG, 'token expired, not playing tts')
          }
        }
        this.ttsAudio.onplay = () => {
          console.log(LOG_TAG, 'ttsAudio play event')
          this.pubSub.publish('onVoiceChromeUpdate', 'VOICE_CHROME_SPEAKING')
        }
        this.ttsAudio.onended = () => {
          console.log(LOG_TAG, 'ttsAudio ended event')
          this.webAudio.releaseAudioFocus().then(() => {
            this.pubSub.publish('onVoiceChromeUpdate', 'VOICE_CHROME_IDLE')
            // 2019-12-06, resolve after release
            resolve()
          })
        }
        // TEST:
        this.ttsAudio.onerror = () => {
          console.log(LOG_TAG, 'Error! Something went wrong')
        }
        this.ttsAudio.onloadedmetadata = () => {
          console.log(LOG_TAG, 'Media data loaded')
        }
        this.ttsAudio.onstalled = () => {
          console.log(LOG_TAG, 'Media data is not available')
        }
      })
    })
  }
}
export default new VPA()
