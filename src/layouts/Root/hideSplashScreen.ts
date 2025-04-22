import { SplashScreen } from 'expo-router'
import { log } from '@/telemetry'

export default async function hideSplashScreen() {
  return SplashScreen.hideAsync().then(() => {
    log.info('Splash screen hidden')
  })
}
