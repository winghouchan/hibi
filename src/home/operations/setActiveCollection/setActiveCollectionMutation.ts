import { MutationOptions } from '@tanstack/react-query'
import setActiveCollection from './setActiveCollection'

export default {
  mutationFn: setActiveCollection,
} satisfies MutationOptions<
  Awaited<ReturnType<typeof setActiveCollection>>,
  Error,
  Parameters<typeof setActiveCollection>[0]
>
