import { useLingui } from '@lingui/react/macro'
import { useNavigation } from 'expo-router'
import { Tabs, TabTrigger, TabList, TabSlot } from 'expo-router/ui'
import { StyleSheet } from 'react-native-unistyles'
import TabButton from './Button'
import ErrorBoundary from './ErrorBoundary'

const styles = StyleSheet.create(({ spacing }, { insets }) => ({
  tabList: {
    gap: spacing[7],
    justifyContent: 'space-evenly',
    paddingLeft: insets.left + spacing[7],
    paddingRight: insets.right + spacing[7],
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
        <TabSlot />
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
