import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Formik, type FormikConfig } from 'formik'
import { Alert } from 'react-native'
import { log } from '@/telemetry'
import { Button, TextField } from '@/ui'
import {
  createCollectionMutation,
  updateCollectionMutation,
} from '../../operations'
import baseQueryKey from '../../operations/baseQueryKey'
import { collection } from '../../schema'

interface Props {
  collection?: typeof collection.$inferSelect
  onSubmit?: (arg: typeof collection.$inferSelect) => void
}

export default function CollectionEditorForm({ collection, onSubmit }: Props) {
  const { i18n } = useLingui()
  const queryClient = useQueryClient()
  const { mutateAsync: createCollection } = useMutation(
    createCollectionMutation,
  )
  const { mutateAsync: updateCollection } = useMutation(
    updateCollectionMutation,
  )

  const isUpdatingCollection = typeof collection?.id !== 'undefined'

  const initialValues = {
    id: collection?.id ?? undefined,
    name: collection?.name ?? '',
  }

  const handleSubmit: FormikConfig<typeof initialValues>['onSubmit'] = async (
    values,
  ) => {
    type Action = typeof isUpdatingCollection extends true
      ? typeof updateCollection
      : typeof createCollection

    const action = (
      isUpdatingCollection ? updateCollection : createCollection
    ) as Action

    const errorMessage = isUpdatingCollection
      ? i18n.t(msg`There was an error updating the collection`)
      : i18n.t(msg`There was an error creating the collection`)

    const handlers: Parameters<Action>[1] = {
      async onSuccess(data) {
        await queryClient.invalidateQueries({ queryKey: [baseQueryKey] })
        onSubmit?.(data)
      },
      onError(error) {
        // @todo Handle error
        Alert.alert(i18n.t(msg`Something went wrong`), errorMessage, [
          {
            text: i18n.t(msg`Try again`),
            style: 'default',
            isPreferred: true,
            onPress: async () => {
              await action(values, handlers)
            },
          },
          {
            text: i18n.t(msg`Cancel`),
            style: 'cancel',
          },
        ])

        log.error(error)
      },
    }

    try {
      await action(values, handlers)
    } catch {
      // Errors handled by error handler above
    }
  }

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      onSubmit={handleSubmit}
    >
      {({ handleChange, handleSubmit, isSubmitting, values }) => (
        <>
          <TextField
            accessibilityLabel={i18n.t(msg`Enter a collection name`)}
            autoFocus
            onChangeText={(value) => handleChange('name')(value)}
            onSubmitEditing={() => handleSubmit()}
            placeholder={i18n.t(msg`Collection name`)}
            testID="collection.editor.name"
            value={values.name}
          />
          <Button testID="collection.editor.cta" onPress={() => handleSubmit()}>
            {isSubmitting ? (
              <Trans component={null}>Submitting</Trans>
            ) : isUpdatingCollection ? (
              <Trans component={null}>Update collection</Trans>
            ) : (
              <Trans component={null}>Create collection</Trans>
            )}
          </Button>
        </>
      )}
    </Formik>
  )
}
