import { Trans, useLingui } from '@lingui/react/macro'
import { type NavigationProp } from '@react-navigation/native'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, Redirect, useNavigation } from 'expo-router'
import { useEffect } from 'react'
import { Button } from '@/ui'
import { isOnboardingCompleteQuery } from '../../operations'
import Layout from '../Layout'
import style from './WelcomeScreen.styles'

export default function WelcomeScreen() {
  const { t: translate } = useLingui()
  const navigation =
    useNavigation<NavigationProp<{ onboarding: { screen: string } }>>()
  const { data: isOnboardingComplete } = useSuspenseQuery(
    isOnboardingCompleteQuery,
  )

  useEffect(() => {
    if (!isOnboardingComplete) {
      // Resolves flash of blank screen when navigating to `/onboarding/collection`
      navigation.preload('onboarding', { screen: 'collection' })
    }
  }, [isOnboardingComplete, navigation])

  if (isOnboardingComplete) {
    return <Redirect href="/(app)/(tabs)" />
  }

  return (
    <Layout testID="onboarding.welcome.screen">
      <Layout.Main style={style.main}>
        <Trans>Welcome</Trans>
      </Layout.Main>
      <Layout.Footer>
        <Link
          href="/onboarding/collection"
          testID="onboarding.welcome.cta"
          asChild
        >
          <Button>{translate`Start`}</Button>
        </Link>
      </Layout.Footer>
    </Layout>
  )
}
