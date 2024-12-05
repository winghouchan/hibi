import Constants, { ExecutionEnvironment } from 'expo-constants'

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
      const { default: fixture } = require.context('../fixtures')(
        `./${databaseFixture}.ts`,
      )

      await fixture()
    }
  }
}
