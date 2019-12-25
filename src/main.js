import Vue from 'vue'
import App from './App'
import ObigoUI from 'obigo-js-ui'
import router from './router'
import store from './store'

// import 'obigo-js-ui/features/commonPopup'

// import 'obigo-js-webapi/lbs/lbs'
// import 'obigo-js-webapi/navigation/navigation'
// import 'obigo-js-webapi/pim/pim'
// import 'obigo-js-webapi/speech/speech'
// import 'obigo-js-webapi/telephony/telephony'

Vue.use(ObigoUI)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
