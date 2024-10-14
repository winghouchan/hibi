import '@testing-library/react-native/extend-expect'
import registerRequireContextHook from 'babel-plugin-require-context-hook/register'
import * as matchers from 'jest-extended'

expect.extend(matchers)

registerRequireContextHook()
