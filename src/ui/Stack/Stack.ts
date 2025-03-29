import type {
  ParamListBase,
  StackNavigationState,
} from '@react-navigation/native'
import {
  createStackNavigator,
  type StackNavigationEventMap,
  type StackNavigationOptions,
} from '@react-navigation/stack'
import { withLayoutContext } from 'expo-router'

const { Navigator } = createStackNavigator()
const Stack = withLayoutContext<
  StackNavigationOptions,
  typeof Navigator,
  StackNavigationState<ParamListBase>,
  StackNavigationEventMap
>(Navigator)

export default Stack
