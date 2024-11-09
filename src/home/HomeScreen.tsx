import { Trans } from '@lingui/macro'
import { Link } from 'expo-router'
import { View } from 'react-native'

export default function HomeScreen() {
  return (
    <View testID="home.screen">
      <Trans>Hibi</Trans>
      <Link testID="home.screen.cta.button" href="/review">
        <Trans>Start review</Trans>
      </Link>
    </View>
  )
}
