import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormikConfig, useFormik } from 'formik'
import {
  createCollectionMutation,
  updateCollectionMutation,
} from '@/collections/operations'
import { Collection } from '@/collections/schema'
import { log } from '@/telemetry'
import { onboardingCollectionQuery } from '../../operations'

type Values = { id?: Collection['id']; name: Collection['name'] }

interface Params {
  initialValues: Values
  onSubmitSuccess?: () => void
  onSubmitError?: (error: Error, retry: () => void) => void
  validationSchema: FormikConfig<Values>['validationSchema']
}

export default function useForm({
  initialValues,
  onSubmitSuccess,
  onSubmitError,
  validationSchema,
}: Params) {
  const { mutateAsync: createCollection } = useMutation(
    createCollectionMutation,
  )
  const { mutateAsync: updateCollection } = useMutation(
    updateCollectionMutation,
  )
  const queryClient = useQueryClient()

  const onSubmit: FormikConfig<typeof initialValues>['onSubmit'] = async (
    values,
    { setFieldValue },
  ) => {
    type Action = typeof values.id extends number
      ? typeof updateCollection
      : typeof createCollection

    const doesCollectionExist = values.id !== undefined

    const submit = (
      doesCollectionExist ? updateCollection : createCollection
    ) as Action

    const handlers: Parameters<Action>[1] = {
      async onSuccess({ id }) {
        await queryClient.invalidateQueries({
          queryKey: onboardingCollectionQuery.queryKey,
        })

        await setFieldValue('id', id)

        onSubmitSuccess?.()
      },
      onError(error) {
        log.error(error)
        onSubmitError?.(error, async () => submit(values, handlers))
      },
    }

    try {
      await submit(values, handlers)
    } catch {
      // Errors handled by `submit`'s error handler
    }
  }

  return useFormik({
    enableReinitialize: true,
    initialValues,
    onSubmit,
    validationSchema,
  })
}
