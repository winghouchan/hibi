import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import type {
  NavigationHelpers,
  StackNavigationState,
} from '@react-navigation/native'
import { Pressable, View } from 'react-native'
import { Progress } from '@/ui'
import style from './style'

interface Props {
  navigation: NavigationHelpers<any>
  state: StackNavigationState<any>
}

const progress = {
  collection: 10,
  notes: 60,
}

export default function Header({
  navigation,
  state: { index: routeIndex, routes },
}: Props) {
  const { i18n } = useLingui()
  const { name: currentRouteName } = routes[routeIndex]
  const progressKey = currentRouteName.includes('notes')
    ? 'notes'
    : 'collection'

  return (
    <View style={[style.header]}>
      <View>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
        >
          <Trans>Back</Trans>
        </Pressable>
      </View>
      <View style={style.progress}>
        <Progress
          label={i18n.t(msg`Onboarding progress`)}
          value={progress[progressKey]}
        />
      </View>
    </View>
  )
}
