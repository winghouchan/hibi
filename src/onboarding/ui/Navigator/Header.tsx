import { useLingui } from '@lingui/react/macro'
import type {
  NavigationHelpers,
  StackNavigationState,
} from '@react-navigation/native'
import { useLocales } from 'expo-localization'
import { Pressable, View } from 'react-native'
import { Icon, Progress } from '@/ui'
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
  const { t: translate } = useLingui()
  const [{ textDirection }] = useLocales()
  const { name: currentRouteName } = routes[routeIndex]
  const progressKey = currentRouteName.includes('notes')
    ? 'notes'
    : 'collection'

  return (
    <View style={[style.header]}>
      <View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={translate`Go back`}
          onPress={() => navigation.goBack()}
        >
          <Icon
            name={textDirection === 'rtl' ? 'arrow-right' : 'arrow-left'}
            size={32}
          />
        </Pressable>
      </View>
      <View style={style.progress}>
        <Progress
          label={translate`Onboarding progress`}
          value={progress[progressKey]}
        />
      </View>
    </View>
  )
}
