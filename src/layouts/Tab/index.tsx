import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { Tabs } from 'expo-router'

export default function TabLayout() {
  const { i18n } = useLingui()

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: i18n.t(msg`Home`),
          tabBarButtonTestID: 'tab.home.button',
        }}
      />
      <Tabs.Screen
        name="library/index"
        options={{
          title: i18n.t(msg`Library`),
          tabBarButtonTestID: 'tab.library.button',
        }}
      ></Tabs.Screen>
    </Tabs>
  )
}
