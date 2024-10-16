import { SplashScreen } from 'expo-router'
import { useState } from 'react'

SplashScreen.preventAutoHideAsync()

/**
 * Returns the (assumed) visibility of the splash screen and a function to hide it.
 *
 * The visibility of the splash screen is assumed because Expo and React Native do
 * not have an API to get the visibility of the splash screen. As a result, the
 * splash screen visibility state is initialised to `true` and only set to `false`
 * when the `hide` function is called`.
 *
 * This hook should not be used outside the root layout as each hook would have
 * its own instance of state.
 *
 * @private
 */
export default function useSplashScreen() {
  const [visible, setVisible] = useState(true)

  const hide = async () => {
    await SplashScreen.hideAsync()
    setVisible(false)
  }

  return {
    visible,
    hide,
  }
}
