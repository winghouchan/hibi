import AsyncStorage from '@react-native-async-storage/async-storage'
// @ts-ignore -- `./storybook.requires` may not exist if the `build:storybook:native` has not been run
// eslint-disable-next-line import/no-unresolved
import { view } from './storybook.requires'

const StorybookUIRoot = view.getStorybookUI({
  storage: {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
  },
})

export default StorybookUIRoot
