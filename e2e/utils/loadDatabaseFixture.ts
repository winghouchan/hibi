import Constants, { ExecutionEnvironment } from 'expo-constants'
import { log } from '@/telemetry'

export default async function loadDatabaseFixture() {
  if (
    process.env.EXPO_PUBLIC_E2E &&
    Constants.executionEnvironment !== ExecutionEnvironment.StoreClient
  ) {
    const { LaunchArguments } = await import('react-native-launch-arguments')
    const { databaseFixture } = LaunchArguments.value<{
      databaseFixture?: string
    }>()

    if (databaseFixture) {
      try {
        log.info('Loading database fixture', { fixture: databaseFixture })

        const { default: fixture } = require.context('../fixtures')(
          `./${databaseFixture}.ts`,
        )

        await fixture()
      } catch (error) {
        log.error('Loading database fixture failed:', error)
      }
    }
  }
}
