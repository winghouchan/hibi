import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useQuery } from '@tanstack/react-query'
import { Link, Redirect } from 'expo-router'
import { useEffect } from 'react'
import { Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { isOnboardingCompleteQuery } from '../isOnboardingComplete'

export default function WelcomeScreen() {
  const { i18n } = useLingui()
  const {
    data: isOnboardingComplete,
    error,
    isFetching,
    refetch,
  } = useQuery(isOnboardingCompleteQuery)

  useEffect(() => {
    if (!isFetching && error) {
      // @todo Handle error
      Alert.alert(
        i18n.t(msg`Something went wrong`),
        i18n.t(msg`There was a failure getting your onboarding status`),
        [{ text: i18n.t(msg`Try again`), onPress: () => refetch() }],
      )

      console.error(error)
    }
  }, [error, i18n, isFetching, refetch])

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
