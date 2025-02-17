import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import type { NavigationProp } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import { ComponentProps, useEffect } from 'react'
import { Alert, ScrollView } from 'react-native'
import { collectionQuery } from '../../operations'
import CollectionEditorForm from './CollectionEditorForm'
import useDeepLinkHandler, { checkIsDeepLink } from './useDeepLinkHandler'

export default function CollectionEditorScreen() {
  const { i18n } = useLingui()
  const navigation = useNavigation<
    NavigationProp<{
      '(tabs)': undefined
      collection: undefined
    }>
  >('/(app)')
  const navigationState = navigation.getState()
  const isDeepLink = checkIsDeepLink(navigationState)
  const localSearchParams = useLocalSearchParams<{ id?: string }>()
  const collectionId =
    typeof localSearchParams.id !== 'undefined'
      ? Number(localSearchParams.id)
      : undefined
  const isUpdatingCollection = typeof collectionId !== 'undefined'
  const { data: collection, isFetching: isFetchingCollection } = useQuery(
    collectionQuery(collectionId),
  )

  const onSubmit: ComponentProps<typeof CollectionEditorForm>['onSubmit'] = ({
    id,
  }) => {
    if (isUpdatingCollection) {
      router.back()
    } else {
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
  }

  useEffect(() => {
    if (
      !isDeepLink &&
      isUpdatingCollection &&
      !collection &&
      !isFetchingCollection
    ) {
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
  }, [collection, i18n, isDeepLink, isFetchingCollection, isUpdatingCollection])

  useDeepLinkHandler({
    collection,
    isFetchingCollection,
    isUpdatingCollection,
  })

  if (
    (isUpdatingCollection && collection) ||
    (!isUpdatingCollection && typeof collection === 'undefined')
  ) {
    return (
      <ScrollView testID="collection.editor.screen">
        <CollectionEditorForm collection={collection} onSubmit={onSubmit} />
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
