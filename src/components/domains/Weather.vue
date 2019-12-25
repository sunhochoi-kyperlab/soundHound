<template>
  <div v-if="weatherNuggetKindSupported">
    <!-- <div class="response-text">
      <p>{{results.WrittenResponse}}</p>
    </div> -->
    <div class="weather-card">
      <div class="detail">
        <i><img :src="weather.imgSrc" :class="weather.imgClass" alt=""></i>
        <div class="detail-right">
          <p class="temperature">{{weather.temperature}}</p>
          <p class="explanation">{{weather.explanation}}</p>
        </div>      
      </div>
      <div class="area">
          <span class="location">{{weather.location}}</span>
          <span class="date">·{{weather.dayAndDate}}</span>
      </div>
    </div>    
  </div>
  <div v-else>
    <div class="fallback-card">
      <p class="main-text">{{results.WrittenResponse}}</p>
    </div>    
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import dateFormat from 'date-fns/format'
import isSameDay from 'date-fns/is_same_day'

export default {
  name: 'Weather',
  data () {
    return {
      weather: {},
      weatherNuggetKindSupported: true
    }
  },
  computed: {
    ...mapGetters({
      results: 'obigo/results'
    })
  },
  created () {
    console.log(this.$options.name, 'results:', this.results)

    // RENDER
    let info = this.results.InformationNuggets[0]
    // Weather renders differ according to WeatherNuggetKind
    switch (info.WeatherNuggetKind) {
      case 'ShowWeatherCurrentConditions': // TODAY
        this.showWeatherCurrentConditions(info)
        break
      case 'ShowWeatherForecastDaily': // TOMORROW
        this.showWeatherForecastDaily(info)
        break
      default:
        this.weatherNuggetKindSupported = false
    }

    // PLAY_TTS
    this.$store.dispatch('vpa/playTTS', {audioBytes: this.results.ResponseAudioBytes})
  },
  methods: {
    getLocation (location) {
      console.log(this.$options.name, 'getLocation:', location)
      if (location.SpokenLabel !== 'The Current Location') {
        return location.SpokenLabel
      } else if (location.City) {
        return location.City
      } else {
        return location.Country
      }
    },
    showWeatherCurrentConditions (payload) {
      console.log(this.$options.name, 'showWeatherCurrentConditions')
      this.weather.location = this.getLocation(payload.Location)
      const observated /* Houndify.Date */ = payload.ObservationDateAndTime.Date
      const date = new Date(observated.Year, observated.Month - 1, observated.DayOfMonth)
      this.weather.dayAndDate = dateFormat(date, ['dddd, MMMM DD, YYYY'])
      this.weather.imgClass = payload.ConditionsImage.Key
      this.weather.imgSrc = 'img/weather/' + this.weather.imgClass + '.png'
      this.weather.temperature = payload.TemplateData.Items[1].TemplateData.Rows[0].RightText
      this.weather.explanation = payload.ConditionsShortPhrase
    },
    showWeatherForecastDaily (payload) {
      console.log(this.$options.name, 'showWeatherForecastDaily')
      // find the forecast from DailyForecasts array using StartDateAndTime
      const startDate /* Houndify.Date */  = payload.StartDateAndTime.Date
      const dateToFind = new Date(startDate.Year, startDate.Month - 1, startDate.DayOfMonth)
      const forecast = payload.DailyForecasts.find((_forecast) => {
        const _forecastDate /* Houndify.Date */ = _forecast.ForecastDateAndTime.Date
        const _dateForecast = new Date(_forecastDate.Year, _forecastDate.Month - 1, _forecastDate.DayOfMonth)
        return isSameDay(_dateForecast, dateToFind)
      })
      console.log(this.$options.name, 'forecast:', forecast)
      const date = new Date(
        forecast.ForecastDateAndTime.Date.Year,
        forecast.ForecastDateAndTime.Date.Month - 1,
        forecast.ForecastDateAndTime.Date.DayOfMonth,
      )
      this.weather.dayAndDate = dateFormat(date, ['dddd , MMMM DD, YYYY'])
      this.weather.imgClass = forecast.ConditionsImage.Key
      this.weather.imgSrc = 'img/weather/' + this.weather.imgClass + '.png'
      const highTemperature = forecast.HighTemperature.Value
      this.weather.temperature = highTemperature.Value + ' ' + highTemperature.WrittenUnits
      this.weather.explanation = forecast.ForecastShortPhrase
    }
  }
}
</script>

<style lang="scss" scoped>

.weather-card {
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
  padding-top: 50px;
}
.area{
    text-align: center;
    margin-top: 37px;
    span{
        font-size: 33px;
        line-height: 37px;
        &.date {
            color: #79787f;
        }
        &.location {
            color: #fff;
        }
    }
}
.detail {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  > i {
    display: block;
    width: 342px;
    height: 240px;
  }
  .detail-right {
    width: 272px;
    padding-left: 36px;
    .temperature {
      font-size: 60px;
    }
    .explanation {
      font-size: 35px;
      line-height: 175%;
      color: #969696;
    }
  }  
}
</style>
