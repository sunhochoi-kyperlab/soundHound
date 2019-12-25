import PubSub from './pubSub'

const LOG_TAG = '[Houndify]'
let instance
class HoundHelper {
  constructor () {
    if (instance) return instance

    // ces-vpa-2020
    this.HOUNDIFY_CLIENT_ID = 'pbBf6_DgQpeozq34n2hEsg=='
    this.HOUNDIFY_CLIENT_KEY = '02dJngrsDaMMSTsgTJR70_1OZSVkWEo4jDVDL48guWEePt4wbx9yP5aGfylZPHPBWlMpD_xp05sZT9fk0DE3kQ=='

    this.pubSub = new PubSub()

    this.audioRecorder = new window.Houndify.AudioRecorder()
    this.voiceRequest = null
    this.textRequest = null
    this._requestInfo = null
    this.conversationState = null
    this.convertAudioToSpeex = false // true: Speex, false: WAV

    this._discardResponse = false // true: abort ongoing voiceRequest and discard response recevied

    // init resample controller from xaudio.js
    this.resampleControl = new window.Resampler(this.audioRecorder.sampleRate, 16000, 1, this.audioRecorder.bufferSize, true)

    this.audioRecorder.on('start', () => {
      console.log(LOG_TAG, 'recorder start')
      this._discardResponse = false
      // Intiailize Houndify.VoiceRequest
      this.voiceRequest = this.initVoiceRequest(this.audioRecorder.sampleRate)

      if (!this.convertAudioToSpeex && this.voiceRequest) {
        console.log(LOG_TAG, 'resampling audio from 44100 to 16000...')
         // first write wav header
        this.voiceRequest.write(this.buildWaveHeader())
      }

      this.pubSub.publish('onVoiceChromeUpdate', 'VOICE_CHROME_LISTENING')
    })
    this.audioRecorder.on('data', (data) => {
      if (!this.convertAudioToSpeex) {
        // resample audio from 44100 to 16000
        let resampleLength = this.resampleControl.resampler(data)
        // convert Float32Array to Int16Array
        let int16data = new Int16Array(resampleLength)
        for (let i = 0; i < resampleLength; i++) {
          int16data[i] = this.resampleControl.outputBuffer[i] * 0x8000
        }
        this.voiceRequest.write(int16data)
      } else {
        this.voiceRequest.write(data)
      }
    })
    this.audioRecorder.on('end', () => {
      if (!this._discardResponse) {
        console.log(LOG_TAG, 'recording stopped. voiceRequest.onResponse() will be called.')
        this.pubSub.publish('onVoiceChromeUpdate', 'VOICE_CHROME_THINKING')
      } else {
        console.log(LOG_TAG, 'recording stopped. abort ongoing voiceRequest')
      }
    })
    this.audioRecorder.on('error', (error) => {
      console.log(LOG_TAG, 'recorder error, voiceRequest.onError() will be called: ' + error)
      this.pubSub.publish('onError', {origin: 'HOUNDIFY_AUDIO_RECORDER', errorData: error})
    })

    instance = this
  }
  set requestInfo (requestInfo) {
    this._requestInfo = requestInfo
  }
  set discardResponse (boolean) {
    this._discardResponse = boolean
  }
  initVoiceRequest (sampleRate) {
    return new window.Houndify.VoiceRequest({
      clientId: this.HOUNDIFY_CLIENT_ID,
      clientKey: this.HOUNDIFY_CLIENT_KEY,

      // Request Info JSON
      // See https://houndify.com/reference/RequestInfo
      requestInfo: this._requestInfo,

      // Pass the current ConversationState stored from previous queries
      // See https://www.houndify.com/docs#conversation-state
      conversationState: this.conversationState,

      // Sample rate of input audio, default: 16000
      // Convert 8/16 kHz mono 16-bit little-endian PCM samples to Speex, default: true.
      // If set to "false", VoiceRequest.write() will accept raw WAV, Opus or Speex bytes,
      // and send them to backend without any conversion.
      convertAudioToSpeex: false,

      // Sample rate of input audio
      sampleRate: sampleRate,

      // Enable Voice Activity Detection, default: true
      enableVAD: true,

      // Fires every time backend sends a speech-to-text
      // transcript of a voice query
      // See https://houndify.com/reference/HoundPartialTranscript
      onTranscriptionUpdate: (transcript) => {
        if (transcript.SafeToStopAudio) {
          this.pubSub.publish('onVoiceChromeUpdate', 'VOICE_CHROME_STOP_LISTENING')
          this.audioRecorder.stop() // necessary?
        }
        this.pubSub.publish('onTranscriptionUpdate', transcript)
      },

      // Fires after server responds with Response JSON
      // Info object contains useful information about the completed request
      // See https://houndify.com/reference/HoundServer
      onResponse: (response, info) => {
        this.audioRecorder.stop() // 호출하지 않으면 계속 녹음됨
        if (!this._discardResponse) {
          if (response.AllResults && response.AllResults.length) {
            // Pick and store appropriate ConversationState from the results.
            this.conversationState = response.AllResults[0].ConversationState
            this.pubSub.publish('onResponse', {response: response, info: info})
          } else {
            this.pubSub.publish('onError', {origin: 'HOUNDIFY_VOICE_REQUEST', errorData: 'onResponse undefined'})
          }
        } else {
          console.log(LOG_TAG, 'onResponse called but discarded')
        }
      },

      // Fires if error occurs during the request
      onError: (err, info) => {
        this.audioRecorder.stop()
        // this.pubSub.publish('onVoiceChromeUpdate', 'VOICE_CHROME_ERROR') // Error 이벤트만 보낼뿐 UI는 직접 업데이트하지 않는다.
        this.pubSub.publish('onError', {origin: 'HOUNDIFY_VOICE_REQUEST', errorData: {err: err, info: info}})
      }
    })
  }
  initTextRequest (/* {queryString, ClientMatches} */ payload) {
    let _requestInfo = this._requestInfo
    if (payload.ClientMatches) {
      _requestInfo.ClientMatches = payload.ClientMatches
    }
    return new Promise((resolve, reject) => {
      this.textRequest = new window.Houndify.TextRequest({
        query: payload.queryString,
        clientId: this.HOUNDIFY_CLIENT_ID,
        clientKey: this.HOUNDIFY_CLIENT_KEY,
        requestInfo: _requestInfo,
        conversationState: this.conversationState,
        onResponse: (response, info) => {
          resolve({response: response, info: info})
        },
        onError: (err, info) => {
          this.pubSub.publish('onError', {origin: 'HOUNDIFY_TEXT_REQUEST', errorData: {err: err, info: info}})
          reject(err)
        }
      })
    })
  }
  // https://ccrma.stanford.edu/courses/422/projects/WaveFormat/
  buildWaveHeader () {
    // console.log('buillding wave header...')
    var numFrames = 0
    var numChannels = 1
    var sampleRate = 16000
    var bytesPerSample = 2
    var blockAlign = numChannels * bytesPerSample
    var byteRate = sampleRate * blockAlign
    var dataSize = numFrames * blockAlign

    var buffer = new ArrayBuffer(44)
    var dv = new DataView(buffer)

    var p = 0

    function writeString (s) {
      for (var i = 0; i < s.length; i++) {
        dv.setUint8(p + i, s.charCodeAt(i))
      }
      p += s.length
    }

    function writeUint32 (d) {
      dv.setUint32(p, d, true)
      p += 4
    }

    function writeUint16 (d) {
      dv.setUint16(p, d, true)
      p += 2
    }

    writeString('RIFF')              // ChunkID
    writeUint32(dataSize + 36)       // ChunkSize
    writeString('WAVE')              // Format
    writeString('fmt ')              // Subchunk1ID
    writeUint32(16)                  // Subchunk1Size
    writeUint16(1)                   // AudioFormat
    writeUint16(numChannels)         // NumChannels
    writeUint32(sampleRate)          // SampleRate
    writeUint32(byteRate)            // ByteRate
    writeUint16(blockAlign)          // BlockAlign
    writeUint16(bytesPerSample * 8)  // BitsPerSample
    writeString('data')              // Subchunk2ID
    writeUint32(dataSize)            // Subchunk2Size

    return buffer
  }
}
export default HoundHelper
