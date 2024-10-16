import { queryOptions } from '@tanstack/react-query'
import isOnboardingComplete from './isOnboardingComplete'

export default queryOptions({
  queryKey: ['onboarding', 'complete'],
  queryFn: isOnboardingComplete,
})
