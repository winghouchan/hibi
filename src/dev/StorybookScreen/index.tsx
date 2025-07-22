import { Unmatched } from 'expo-router'
import { lazy } from 'react'

const Storybook = __DEV__ && lazy(() => import('.storybook/native'))

export default function StorybookScreen() {
  return Storybook ? <Storybook /> : <Unmatched />
}
