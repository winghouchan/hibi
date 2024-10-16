import { isOnboardingCompleteQuery } from '@/onboarding'
import { useQuery } from '@tanstack/react-query'
import { Redirect, Tabs } from 'expo-router'

export default function AppLayout() {
  const { data: isOnboardingComplete, isFetching } = useQuery(
    isOnboardingCompleteQuery,
  )

  if (!isFetching && isOnboardingComplete === false) {
    return <Redirect href=".." />
  }

  return <Tabs />
}
