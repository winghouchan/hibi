import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { SplashScreen } from 'expo-router'
import { Suspense, useState } from 'react'
import { LogBox } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { DataProvider } from '@/data'
import { configureDevMenu } from '@/dev'
import { IntlProvider } from '@/intl'
import { log } from '@/telemetry'
import ErrorBoundary from './ErrorBoundary'
import Navigator from './Navigator'

LogBox.ignoreAllLogs()

log.info('Opened app')

SplashScreen.preventAutoHideAsync()

configureDevMenu()

export default function RootLayout() {
  const [databaseReady, setDatabaseReady] = useState(false)

  return (
    <IntlProvider>
      <ErrorBoundary>
        <DataProvider onReady={() => setDatabaseReady(true)}>
          <GestureHandlerRootView>
            <BottomSheetModalProvider>
              <Suspense>{databaseReady && <Navigator />}</Suspense>
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </DataProvider>
      </ErrorBoundary>
    </IntlProvider>
  )
}
