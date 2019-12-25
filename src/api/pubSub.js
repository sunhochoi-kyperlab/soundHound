let instance
class PubSub {
  constructor () {
    if (instance) return instance

    this.topics = {}
    this.subUid = -1

    instance = this
  }
  publish (topic, data) {
    if (!this.topics[topic]) {
      return false
    }
    setTimeout(() => {
      let subscribers = this.topics[topic]
      let len = subscribers ? subscribers.length : 0
      while (len--) {
        subscribers[len].handler(data)
      }
    }, 0)
    return true
  }
  subscribe (topic, handler) {
    if (!this.topics[topic]) {
      this.topics[topic] = []
    }
    let token = (++this.subUid).toString()
    this.topics[topic].push({
      token: token,
      handler: handler
    })
    return token
  }
}
export default PubSub
