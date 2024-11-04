import { useQuery } from '@tanstack/react-query'
import { SplashScreen } from 'expo-router'
import { useEffect } from 'react'
import { isOnboardingCompleteQuery } from '@/onboarding'

SplashScreen.preventAutoHideAsync()

interface Props {
  ready: boolean
}

export default function Splash({ ready }: Props) {
  const { isSuccess } = useQuery(isOnboardingCompleteQuery)

  useEffect(() => {
    if (isSuccess && ready) {
      SplashScreen.hideAsync()
    }
  }, [isSuccess, ready])

  return null
}
