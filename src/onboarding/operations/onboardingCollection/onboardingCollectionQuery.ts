import { queryOptions } from '@tanstack/react-query'
import getOnboardingCollection from './getOnboardingCollection'

export default queryOptions({
  queryKey: ['onboarding', 'collection'],
  queryFn: getOnboardingCollection,
})
