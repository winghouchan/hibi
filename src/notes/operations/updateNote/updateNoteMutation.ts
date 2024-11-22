import { MutationOptions } from '@tanstack/react-query'
import updateNote from './updateNote'

export default {
  mutationFn: updateNote,
} satisfies MutationOptions<
  Awaited<ReturnType<typeof updateNote>>,
  Error,
  Parameters<typeof updateNote>[0]
>
