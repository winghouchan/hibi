import { t as translate } from '@lingui/core/macro'
import { type ExpoDevMenuItem, registerDevMenuItems } from 'expo-dev-menu'
import { router } from 'expo-router'
import { DevSettings } from 'react-native'
import { nativeDatabase } from '@/data'

export default function configureDevMenu() {
  const devMenuItems: ExpoDevMenuItem[] = [
    {
      name: translate`📚 Open Storybook`,
      callback: () => {
        router.navigate('/storybook')
      },
    },
    {
      name: translate`🚫 Delete all data`,
      callback: () => {
        nativeDatabase.delete()
        DevSettings.reload()
      },
    },
  ]

  return registerDevMenuItems(devMenuItems)
}
