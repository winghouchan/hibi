import { useLingui } from '@lingui/react/macro'
import { type StackHeaderProps } from '@react-navigation/stack'
import { useLocales } from 'expo-localization'
import { Animated, Pressable, View } from 'react-native'
import { Icon, Progress } from '@/ui'
import style from './Header.styles'

type Props = StackHeaderProps

const onboardingProgress = {
  collection: 10,
  notes: 60,
}

export default function Header({ layout, navigation, progress, route }: Props) {
  const { t: translate } = useLingui()
  const [{ textDirection }] = useLocales()
  const progressKey = route.name.includes('notes') ? 'notes' : 'collection'

  const opacity =
    progress?.next?.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }) ?? 1

  const translateX =
    route.name === 'onboarding/collection'
      ? (progress.current?.interpolate({
          inputRange: [0, 1],
          outputRange: [layout.width, 0],
        }) ?? 0)
      : 0

  return (
    <Animated.View
      style={[style.header, { opacity, transform: [{ translateX }] }]}
    >
      <View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={translate`Go back`}
          onPress={() => navigation.goBack()}
        >
          <Icon
            name={textDirection === 'rtl' ? 'arrow-right' : 'arrow-left'}
            size={28}
          />
        </Pressable>
      </View>
      <View style={style.progress}>
        <Progress
          label={translate`Onboarding progress`}
          value={onboardingProgress[progressKey]}
        />
      </View>
    </Animated.View>
  )
}
