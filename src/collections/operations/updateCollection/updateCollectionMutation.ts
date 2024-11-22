import { MutationOptions } from '@tanstack/react-query'
import updateCollection from './updateCollection'

export default {
  mutationFn: updateCollection,
} satisfies MutationOptions<
  Awaited<ReturnType<typeof updateCollection>>,
  Error,
  Parameters<typeof updateCollection>[0]
>
