import { t as translate } from '@lingui/core/macro'
import { type ExpoDevMenuItem, registerDevMenuItems } from 'expo-dev-menu'
import { router } from 'expo-router'

export default function configureDevMenu() {
  const devMenuItems: ExpoDevMenuItem[] = [
    {
      name: translate`📚 Open Storybook`,
      callback: () => {
        router.navigate('/storybook')
      },
    },
  ]

  return registerDevMenuItems(devMenuItems)
}
