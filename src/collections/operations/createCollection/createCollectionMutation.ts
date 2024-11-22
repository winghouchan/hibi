import { MutationOptions } from '@tanstack/react-query'
import createCollection from './createCollection'

export default {
  mutationFn: createCollection,
} satisfies MutationOptions<
  Awaited<ReturnType<typeof createCollection>>,
  Error,
  Parameters<typeof createCollection>[0]
>
