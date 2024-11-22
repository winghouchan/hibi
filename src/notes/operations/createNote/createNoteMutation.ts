import { MutationOptions } from '@tanstack/react-query'
import createNote from './createNote'

export default {
  mutationFn: createNote,
} satisfies MutationOptions<
  Awaited<ReturnType<typeof createNote>>,
  Error,
  Parameters<typeof createNote>[0]
>
