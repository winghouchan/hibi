import { useSuspenseQuery } from '@tanstack/react-query'
import { Redirect } from 'expo-router'
import { onboardingCollectionQuery } from '../../operations'

export default function Index() {
  const { data: collection } = useSuspenseQuery(onboardingCollectionQuery)

  if (collection) {
    return <Redirect href="/onboarding/notes" />
  } else {
    return <Redirect href="/" />
  }
}
