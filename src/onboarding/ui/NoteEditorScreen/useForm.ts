import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ComponentProps } from 'react'
import { createNoteMutation, updateNoteMutation } from '@/notes/operations'
import { NoteEditor } from '@/notes/ui'
import { onboardingCollectionQuery } from '@/onboarding/operations'
import { log } from '@/telemetry'

interface Params {
  onSubmitSuccess?: () => void
  onSubmitError?: (error: Error, retry: () => void) => void
}

export default function useForm({ onSubmitSuccess, onSubmitError }: Params) {
  const { mutateAsync: createNote } = useMutation(createNoteMutation)
  const { mutateAsync: updateNote } = useMutation(updateNoteMutation)
  const queryClient = useQueryClient()

  const handleSubmit: ComponentProps<typeof NoteEditor>['onSubmit'] = async (
    values,
  ) => {
    const isUpdating = 'id' in values && values.id !== undefined

    type Action = typeof isUpdating extends true
      ? typeof updateNote
      : typeof createNote

    const action = (isUpdating ? updateNote : createNote) as Action

    const handlers: Parameters<Action>[1] = {
      async onSuccess() {
        await queryClient.invalidateQueries({
          queryKey: onboardingCollectionQuery.queryKey,
        })
        onSubmitSuccess?.()
      },
      onError(error: Error) {
        onSubmitError?.(error, async () => {
          await action(values as Parameters<Action>[0], handlers)
        })

        log.error(error)
      },
    }

    try {
      await action(values as Parameters<Action>[0], handlers)
    } catch {
      // Errors handled in `handlers`
    }
  }

  return {
    handleSubmit,
  }
}
