import { Trans, useLingui } from '@lingui/react/macro'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, Redirect } from 'expo-router'
import { Button } from '@/ui'
import { isOnboardingCompleteQuery } from '../../operations'
import Layout from '../Layout'
import style from './style'

export default function WelcomeScreen() {
  const { t: translate } = useLingui()
  const { data: isOnboardingComplete } = useSuspenseQuery(
    isOnboardingCompleteQuery,
  )

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
