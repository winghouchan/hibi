import { MutationOptions } from '@tanstack/react-query'
import completeOnboarding from './completeOnboarding'

export default {
  mutationFn: completeOnboarding,
} satisfies MutationOptions<
  Awaited<ReturnType<typeof completeOnboarding>>,
  Error
>
