import { Trans } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import { Link, Redirect } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '@/ui'
import { isOnboardingCompleteQuery } from '../../operations'

export default function WelcomeScreen() {
  const { data: isOnboardingComplete } = useQuery(isOnboardingCompleteQuery)

  if (isOnboardingComplete) {
    return <Redirect href="/(app)/(tabs)" />
  }

  return (
    <SafeAreaView testID="onboarding.welcome.screen">
      <Trans>Welcome</Trans>
      <Link
        href="/onboarding/collection"
        testID="onboarding.welcome.cta"
        asChild
      >
        <Button>
          <Trans>Start</Trans>
        </Button>
      </Link>
    </SafeAreaView>
  )
}
