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
import {
  collectionQuery,
  createCollectionMutation,
  updateCollectionMutation,
} from '../../operations'
import baseQueryKey from '../../operations/baseQueryKey'

export default function CollectionEditorScreen() {
  const { i18n } = useLingui()
  const navigation = useNavigation<
    NavigationProp<{
      '(tabs)': undefined
      collection: undefined
    }>
  >('/(app)')
  const queryClient = useQueryClient()
  const localSearchParams = useLocalSearchParams<{ id?: string }>()
  const collectionId =
    typeof localSearchParams.id !== 'undefined'
      ? Number(localSearchParams.id)
      : undefined
  const isUpdating = typeof collectionId !== 'undefined'
  const { data: collection, isFetching: isFetchingCollection } = useQuery(
    collectionQuery(collectionId),
  )
  const { mutateAsync: createCollection } = useMutation(
    createCollectionMutation,
  )
  const { mutateAsync: updateCollection } = useMutation(
    updateCollectionMutation,
  )

  const initialValues = {
    id: collectionId,
    name: collection?.name ?? '',
  }

  const onSubmit: FormikConfig<typeof initialValues>['onSubmit'] = async (
    values,
  ) => {
    type Action = typeof isUpdating extends true
      ? typeof updateCollection
      : typeof createCollection

    const action = (isUpdating ? updateCollection : createCollection) as Action

    const errorMessage = isUpdating
      ? i18n.t(msg`There was an error updating the collection`)
      : i18n.t(msg`There was an error creating the collection`)

    const handlers: Parameters<Action>[1] = {
      async onSuccess({ id }) {
        if (isUpdating) {
          await queryClient.invalidateQueries({ queryKey: [baseQueryKey] })
          router.back()
        } else {
          await queryClient.invalidateQueries({ queryKey: [baseQueryKey] })

          /**
           * Navigate to the newly created collection but set the library screen
           * to be the screen to be navigated to upon a back navigation. Not doing
           * this means a back navigation would take the user back to this screen
           * (the collection creation screen) which is undesirable.
           */
          navigation.reset({
            index: 1,
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
                state: {
                  index: 0,
                  routes: [{ name: '[id]/index', params: { id } }],
                },
              },
            ],
          })
        }
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
      },
    }

    try {
      await action(values, handlers)
    } catch {
      // Errors handled by error handler above
    }
  }

  useEffect(() => {
    if (isUpdating && !collection && !isFetchingCollection) {
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
  }, [collection, i18n, isFetchingCollection, isUpdating])

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
          isUpdating
            ? {
                name: 'collection',
                index: 1,
                params: localSearchParams,
                state: {
                  routes: [
                    { name: '[id]/index', params: localSearchParams },
                    { name: '[id]/edit', params: localSearchParams },
                  ],
                },
              }
            : {
                name: 'collection',
                index: 0,
                params: localSearchParams,
                state: {
                  routes: [{ name: 'new', params: localSearchParams }],
                },
              },
        ] as PartialRoute<Route<'(tabs)', undefined>>[],
      })
    }
  })

  if ((isUpdating && collection) || !isUpdating) {
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
                testID="collection.editor.name"
                value={values.name}
              />
              <Button
                testID="collection.editor.cta"
                onPress={() => handleSubmit()}
              >
                {isSubmitting ? (
                  <Trans>Submitting</Trans>
                ) : isUpdating ? (
                  <Trans>Update collection</Trans>
                ) : (
                  <Trans>Create collection</Trans>
                )}
              </Button>
            </>
          )}
        </Formik>
      </ScrollView>
    )
  } else {
    /**
     * If the `collectionId` is defined and the collection is `undefined`, the
     * collection has not been successfully queried yet. If the query is still
     * in-progress, it typically takes less than 1 second to complete so no
     * loading state is shown. If the query failed, an alert is shown by the
     * data provider component.
     *
     * If the collection is `null`, it does not exist. An alert is displayed
     * by the effect hook above.
     */
    return null
  }
}
