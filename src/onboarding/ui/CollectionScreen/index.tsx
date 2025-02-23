import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Formik, type FormikConfig } from 'formik'
import { Alert, View } from 'react-native'
import {
  createCollectionMutation,
  updateCollectionMutation,
} from '@/collections'
import { log } from '@/telemetry'
import { Button, TextInput } from '@/ui'
import { onboardingCollectionQuery } from '../../operations'
import Layout from '../Layout'

export default function CollectionScreen() {
  const { i18n } = useLingui()
  const queryClient = useQueryClient()
  const { data: collection } = useQuery(onboardingCollectionQuery)
  const { mutateAsync: createCollection } = useMutation(
    createCollectionMutation,
  )
  const { mutateAsync: updateCollection } = useMutation(
    updateCollectionMutation,
  )

  const initialValues = {
    id: collection?.id,
    name: collection?.name ?? '',
  }

  const onSubmit: FormikConfig<typeof initialValues>['onSubmit'] = async (
    values,
    { setFieldValue },
  ) => {
    type SubmitFunction<
      Values extends
        | Parameters<typeof updateCollection>[0]
        | Parameters<typeof createCollection>[0],
    > = Values extends Parameters<typeof updateCollection>[0]
      ? typeof updateCollection
      : typeof createCollection

    const doesCollectionExist = values.id !== undefined

    const submit = (
      doesCollectionExist ? updateCollection : createCollection
    ) as SubmitFunction<typeof values>

    const handlers: Parameters<typeof submit>[1] = {
      async onSuccess({ id }) {
        await queryClient.invalidateQueries({
          queryKey: onboardingCollectionQuery.queryKey,
        })
        await setFieldValue('id', id)
        router.push('/onboarding/notes')
      },
      onError(error) {
        // @todo Handle error
        Alert.alert(
          i18n.t(msg`Something went wrong`),
          doesCollectionExist
            ? i18n.t(msg`There was an error updating the collection`)
            : i18n.t(msg`There was an error creating the collection`),
          [
            {
              text: i18n.t(msg`Try again`),
              style: 'default',
              isPreferred: true,
              onPress: async () => {
                await submit(values, handlers)
              },
            },
            {
              text: i18n.t(msg`Cancel`),
              style: 'cancel',
            },
          ],
        )
        log.error(error)
      },
    }

    try {
      await submit(values, handlers)
    } catch {
      // Errors handled by `submit`'s error handler
    }
  }

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {({ handleChange, handleSubmit, isSubmitting, values }) => (
        <Layout testID="onboarding.collection.screen">
          <Layout.Main>
            <Trans>What are you learning?</Trans>
            <TextInput
              accessibilityLabel={i18n.t(msg`Enter a collection name`)}
              autoFocus
              onChangeText={(value) => handleChange('name')(value)}
              onSubmitEditing={() => handleSubmit()}
              placeholder={i18n.t(msg`Collection name`)}
              testID="onboarding.collection.name"
              value={values.name}
            />
          </Layout.Main>
          <Layout.Footer>
            <Button
              testID="onboarding.collection.cta"
              onPress={() => handleSubmit()}
            >
              {isSubmitting ? (
                <Trans>Submitting</Trans>
              ) : values.id ? (
                <Trans>Update collection</Trans>
              ) : (
                <Trans>Create collection</Trans>
              )}
            </Button>
          </Layout.Footer>
        </Layout>
      )}
    </Formik>
  )
}
