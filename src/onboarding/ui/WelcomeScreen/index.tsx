import { Trans } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import { Link, Redirect } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { isOnboardingCompleteQuery } from '../../isOnboardingComplete'

export default function WelcomeScreen() {
  const { data: isOnboardingComplete } = useQuery(isOnboardingCompleteQuery)

  if (isOnboardingComplete) {
    return <Redirect href="/(app)" />
  }

  return (
    <SafeAreaView testID="onboarding.welcome.screen">
      <Trans>Welcome</Trans>
      <Link
        href="/onboarding/collection"
        testID="onboarding.welcome.cta.button"
      >
        <Trans>Start</Trans>
      </Link>
    </SafeAreaView>
  )
}
