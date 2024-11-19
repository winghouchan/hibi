import { MutationOptions } from '@tanstack/react-query'
import createReview from './createReview'

export default {
  mutationFn: createReview,
} satisfies MutationOptions<
  Awaited<ReturnType<typeof createReview>>,
  Error,
  Parameters<typeof createReview>[0]
>
