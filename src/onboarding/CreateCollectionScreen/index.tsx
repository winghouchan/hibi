import {
  createCollectionMutation,
  updateCollectionMutation,
} from '@/collections'
import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { router, useNavigation } from 'expo-router'
import { Formik, type FormikConfig } from 'formik'
import { useEffect } from 'react'
import { Alert, Pressable, TextInput, View } from 'react-native'
import { onboardingCollectionQuery } from '../onboardingCollection'

export default function CreateCollectionScreen() {
  const { i18n } = useLingui()
  const navigation = useNavigation()
  const queryClient = useQueryClient()
  const {
    data: collection,
    isFetching,
    error,
    refetch: refetchOnboardingCollection,
  } = useQuery(onboardingCollectionQuery)
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
        console.error(error)
      },
    }

    try {
      await submit(values, handlers)
    } catch {
      // Errors handled by `submit`'s error handler
    }
  }

  useEffect(() => {
    if (!isFetching && error) {
      // @todo Handle error
      Alert.alert(
        i18n.t(msg`Something went wrong`),
        i18n.t(msg`There was a failure getting your onboarding collection`),
        [
          {
            text: i18n.t(msg`Try again`),
            style: 'default',
            isPreferred: true,
            onPress: () => {
              refetchOnboardingCollection()
            },
          },
          {
            text: i18n.t(msg`Cancel`),
            style: 'cancel',
          },
        ],
      )
      console.error(error)
    }
  }, [error, i18n, isFetching, refetchOnboardingCollection])

  return (
    <View testID="onboarding.collection.screen">
      <Pressable accessibilityRole="button" onPress={() => navigation.goBack()}>
        <Trans>Back</Trans>
      </Pressable>
      <Trans>What are you learning?</Trans>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={onSubmit}
      >
        {({ handleChange, handleSubmit, isSubmitting, values }) => (
          <>
            <TextInput
              accessibilityLabel={i18n.t(msg`Enter a collection name`)}
              value={values.name}
              onChangeText={handleChange('name')}
              placeholder={i18n.t(msg`Collection name`)}
              testID="onboarding.collection.name.input"
            />
            <Pressable
              accessibilityRole="button"
              testID="onboarding.collection.cta.button"
              onPress={() => handleSubmit()}
            >
              {isSubmitting ? (
                <Trans>Submitting</Trans>
              ) : values.id ? (
                <Trans>Update collection</Trans>
              ) : (
                <Trans>Create collection</Trans>
              )}
            </Pressable>
          </>
        )}
      </Formik>
    </View>
  )
}
