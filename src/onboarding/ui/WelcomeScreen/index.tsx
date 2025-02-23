import { Trans } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import { Link, Redirect } from 'expo-router'
import { Button } from '@/ui'
import { isOnboardingCompleteQuery } from '../../operations'
import Layout from '../Layout'
import style from './style'

export default function WelcomeScreen() {
  const { data: isOnboardingComplete } = useQuery(isOnboardingCompleteQuery)

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
          <Button>
            <Trans>Start</Trans>
          </Button>
        </Link>
      </Layout.Footer>
    </Layout>
  )
}
