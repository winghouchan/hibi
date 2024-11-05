import { useQuery } from '@tanstack/react-query'
import { Redirect } from 'expo-router'
import { onboardingCollectionQuery } from '../../onboardingCollection'

export default function Index() {
  const { data: collection, isFetching } = useQuery(onboardingCollectionQuery)

  if (collection && !isFetching) {
    return <Redirect href="/onboarding/notes" />
  } else if (!collection && !isFetching) {
    return <Redirect href="/" />
  } else {
    return null
  }
}
