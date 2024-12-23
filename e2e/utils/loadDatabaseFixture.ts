import { LaunchArguments } from 'react-native-launch-arguments'
import { log } from '@/telemetry'

export default async function loadDatabaseFixture() {
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

      log.info('Loaded database fixture', { fixture: databaseFixture })
    } catch (error) {
      log.error('Loading database fixture failed:', error)
    }
  }
}
