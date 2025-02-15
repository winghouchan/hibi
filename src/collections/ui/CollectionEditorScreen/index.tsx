import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import type {
  NavigationProp,
  PartialRoute,
  Route,
} from '@react-navigation/native'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from 'expo-router'
import { Formik, type FormikConfig } from 'formik'
import { useEffect } from 'react'
import { Alert, ScrollView } from 'react-native'
import { Button, TextInput } from '@/ui'
import { collectionQuery, updateCollectionMutation } from '../../operations'
import baseQueryKey from '../../operations/baseQueryKey'

export default function EditCollectionScreen() {
  const { i18n } = useLingui()
  const localSearchParams = useLocalSearchParams<{ id: string }>()
  const navigation = useNavigation<
    NavigationProp<{
      '(tabs)': undefined
    }>
  >('/(app)')
  const queryClient = useQueryClient()
  const { id: collectionId } = localSearchParams
  const { data: collection, isFetching: isFetchingCollection } = useQuery(
    collectionQuery(Number(collectionId)),
  )
  const { mutateAsync: updateCollection } = useMutation(
    updateCollectionMutation,
  )

  const initialValues = {
    id: Number(collectionId),
    name: collection?.name ?? '',
  }

  const onSubmit: FormikConfig<typeof initialValues>['onSubmit'] = async (
    values,
  ) => {
    const handlers: Parameters<typeof updateCollection>[1] = {
      async onSuccess() {
        await queryClient.invalidateQueries({ queryKey: [baseQueryKey] })
        router.back()
      },
      onError(error) {
        // @todo Handle error
        Alert.alert(i18n.t(msg`Something went wrong`), '', [
          {
            text: i18n.t(msg`Try again`),
            style: 'default',
            isPreferred: true,
            onPress: async () => {
              await updateCollection(values, handlers)
            },
          },
          {
            text: i18n.t(msg`Cancel`),
            style: 'cancel',
          },
        ])
      },
    }

    try {
      await updateCollection(values, handlers)
    } catch {
      // Errors handled by error handler above
    }
  }

  useEffect(() => {
    if (!collection && !isFetchingCollection) {
      Alert.alert(i18n.t(msg`The collection doesn't exist`), '', [
        {
          text: i18n.t(msg`OK`),
          style: 'default',
          onPress: () => {
            router.back()
          },
        },
      ])
    }
  }, [collection, i18n, isFetchingCollection])

  useFocusEffect(() => {
    const state = navigation.getState()

    if (state?.routes?.[0]?.state?.routes?.[1]?.name !== 'library/index') {
      navigation.reset({
        routes: [
          {
            name: '(tabs)',
            state: {
              index: 1,
              routes: [{ name: 'index' }, { name: 'library/index' }],
            },
          },
          {
            name: 'collection',
            index: 1,
            params: localSearchParams,
            state: {
              routes: [
                { name: '[id]/index', params: localSearchParams },
                { name: '[id]/edit', params: localSearchParams },
              ],
            },
          },
        ] as PartialRoute<Route<'(tabs)', undefined>>[],
      })
    }
  })

  if (collection) {
    return (
      <ScrollView testID="collection.editor.screen">
        <Formik
          enableReinitialize
          initialValues={initialValues}
          onSubmit={onSubmit}
        >
          {({ handleChange, handleSubmit, isSubmitting, values }) => (
            <>
              <TextInput
                accessibilityLabel={i18n.t(msg`Enter a collection name`)}
                autoFocus
                onChangeText={(value) => handleChange('name')(value)}
                onSubmitEditing={() => handleSubmit()}
                placeholder={i18n.t(msg`Collection name`)}
                testID="onboarding.collection.name"
                value={values.name}
              />
              <Button
                testID="collection.editor.cta"
                onPress={() => handleSubmit()}
              >
                {isSubmitting ? (
                  <Trans>Submitting</Trans>
                ) : (
                  <Trans>Update collection</Trans>
                )}
              </Button>
            </>
          )}
        </Formik>
      </ScrollView>
    )
  } else {
    /**
     * If the collection is `undefined`, it has not been successfully queried
     * yet. If the query is still in-progress, it typically takes less than 1
     * second to complete so no loading state is shown. If the query failed,
     * an alert is shown by the data provider component.
     *
     * If the collection is `null`, it does not exist. An alert is displayed
     * by the effect hook above.
     */
    return null
  }
}
