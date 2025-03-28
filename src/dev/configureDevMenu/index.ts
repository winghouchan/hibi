import { t as translate } from '@lingui/core/macro'
import { type ExpoDevMenuItem, registerDevMenuItems } from 'expo-dev-menu'
import { router } from 'expo-router'
import { DevSettings } from 'react-native'
import { nativeDatabase } from '@/data'
import { log } from '@/telemetry'

export default async function configureDevMenu() {
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

  try {
    return await registerDevMenuItems(devMenuItems)
  } catch (error) {
    log.info('Failed to register dev menu items. Reason:', error)
  }
}
