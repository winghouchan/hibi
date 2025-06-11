import { useLingui } from '@lingui/react/macro'
import { useNavigation } from 'expo-router'
import { Tabs, TabTrigger, TabList, TabSlot } from 'expo-router/ui'
import { Suspense } from 'react'
import { StyleSheet } from 'react-native-unistyles'
import TabButton from './Button'
import ErrorBoundary from './ErrorBoundary'

const styles = StyleSheet.create(({ sizes, spacing }, { insets }) => ({
  tabList: {
    gap: spacing.spacious,
    justifyContent: 'space-evenly',
    paddingLeft: insets.left + spacing.spacious,
    paddingRight: insets.right + spacing.spacious,
    paddingBottom: insets.bottom,
  },
}))

export default function TabLayout() {
  const { t: translate } = useLingui()
  const navigation = useNavigation()
  const navigationState = navigation.getState()
  const errorBoundaryKey = navigationState?.routes[0].state?.index

  return (
    <Tabs>
      <ErrorBoundary key={errorBoundaryKey}>
        <Suspense>
          <TabSlot />
        </Suspense>
      </ErrorBoundary>
      <TabList style={styles.tabList}>
        <TabTrigger name="home" href="/" testID="tab.home.button" asChild>
          <TabButton label={translate`Home`} icon="home" />
        </TabTrigger>
        <TabTrigger
          name="library"
          href="/library"
          testID="tab.library.button"
          asChild
        >
          <TabButton label={translate`Library`} icon="book-open" />
        </TabTrigger>
      </TabList>
    </Tabs>
  )
}
