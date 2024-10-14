import Constants, { ExecutionEnvironment } from 'expo-constants'

export default async function loadDatabaseFixture() {
  if (
    process.env.EXPO_PUBLIC_E2E &&
    Constants.executionEnvironment !== ExecutionEnvironment.StoreClient
  ) {
    await import('react-native-launch-arguments').then(
      ({ LaunchArguments }) => {
        const launchArgs = LaunchArguments.value<{ databaseFixture: string }>()

        if (launchArgs.databaseFixture) {
          require.context('../fixtures')(`./${launchArgs.databaseFixture}.ts`)
        }
      },
    )
  }
}
