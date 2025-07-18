import 'react-native-gesture-handler/jestSetup'
import registerRequireContextHook from 'babel-plugin-require-context-hook/register'
import * as matchers from 'jest-extended'
import failOnConsole from 'jest-fail-on-console'

expect.extend(matchers)

registerRequireContextHook()

failOnConsole({
  silenceMessage(message) {
    return [
      /**
       * Ignore the following error for the deprecated `findNodeHandle` function.
       * This is thrown when the bottom sheet modal is opened.
       *
       * @see {@link https://github.com/software-mansion/react-native-reanimated/issues/6997}
       */
      'findNodeHandle is deprecated in StrictMode',

      /**
       * Ignore the following warning. This is logged from `@gorhom/bottom-sheet`
       * because React Native Reanimated is mocked.
       */
      "Couldn't find the scrollable node handle id",
    ].some((silencedMessage) => message.includes(silencedMessage))
  },
})
