export class Geo {
  static getCurrentPosition (origin) {
    return new Promise((resolve, reject) => {
      if (origin === 'DUMMY') {
        setTimeout(() => {
          // 로댕 미술관 Musee Rodin
          let position = {
            coords: {
              latitude: 48.8477949,
              longitude: 2.3156545
            }
          }
          // console.log('[Geo] gotCurrentPosition from DUMMY', position)
          resolve(position)
        }, 0)
      } else if (window.applicationFramework) {
        window.navigator.lbs.geolocation.getCurrentPosition()
          .then((data) => {
            let position = {
              coords: {
                latitude: data.coords.latitude,
                longitude: data.coords.longitude
              }
            }
            console.log('[Geo] gotCurrentPosition from AF', position)
            resolve(position)
          }, (err) => {
            console.log('[Geo] getCurrentPosition failed', err)
            reject(err)
          })
      } else {
        // Web API
        window.navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('[Geo] gotCurrentPosition from Web API', position)
            resolve(position)
          },
          (positionError) => {
            console.log('[Geo] getCurrentPosition failed', positionError)
            reject(positionError)
          }
        )
      }
    })
  }
}
