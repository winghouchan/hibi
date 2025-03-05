import { useLingui } from '@lingui/react/macro'
import { Tabs } from 'expo-router'

export default function TabLayout() {
  const { t: translate } = useLingui()

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: translate`Home`,
          tabBarButtonTestID: 'tab.home.button',
        }}
      />
      <Tabs.Screen
        name="library/index"
        options={{
          title: translate`Library`,
          tabBarButtonTestID: 'tab.library.button',
        }}
      ></Tabs.Screen>
    </Tabs>
  )
}
