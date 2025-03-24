import { useLingui } from '@lingui/react/macro'
import type {
  NavigationProp,
  PartialRoute,
  Route,
} from '@react-navigation/native'
import { useSuspenseQuery } from '@tanstack/react-query'
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from 'expo-router'
import { ComponentProps } from 'react'
import { Alert } from 'react-native'
import { collectionQuery } from '../../operations'
import Layout from '../Layout'
import CollectionEditorForm from './CollectionEditorForm'

export default function CollectionEditorScreen() {
  const { t: translate } = useLingui()
  const navigation = useNavigation<
    NavigationProp<{
      '(tabs)': undefined
      collection: undefined
    }>
  >('/(app)')
  const localSearchParams = useLocalSearchParams<{ id?: string }>()
  const collectionId =
    typeof localSearchParams.id !== 'undefined'
      ? Number(localSearchParams.id)
      : undefined
  const isUpdatingCollection = typeof collectionId !== 'undefined'
  const { data: collection } = useSuspenseQuery(
    collectionQuery({ filter: { id: collectionId } }),
  )

  const onNonExistentCollection = () => {
    if (
      /**
       * A collection may be non-existent if `collection` is falsy.
       */
      !collection &&
      /**
       * `collection` may also be falsy if the user is trying to create a
       * collection as the collection won't exist yet. As a result, determine
       * if the collection is non-existent only when the user is trying to
       * update one.
       */
      isUpdatingCollection
    ) {
      Alert.alert(translate`The collection doesn't exist`, '', [
        {
          text: translate`OK`,
          style: 'default',
          onPress: () => {
            router.dismissTo('/')
          },
        },
      ])
    }
  }

  const onSubmit: ComponentProps<typeof CollectionEditorForm>['onSubmit'] = ({
    id,
  }) => {
    const navigationState = navigation.getState()

    if (isUpdatingCollection) {
      router.back()
    } else {
      const routes = [
        navigationState.routes[0],
        {
          name: 'collection',
          state: {
            index: 0,
            routes: [
              {
                name: '[id]',
                params: { screen: 'index', id, params: { id } },
              },
            ],
          },
        },
      ] as PartialRoute<Route<'(tabs)' | 'collection', undefined>>[]

      /**
       * Navigate to the newly created collection but remove the editor screen
       * from the history as a back navigation to this screen is undesirable.
       */
      navigation.reset({
        index: routes.length - 1,
        routes,
      })
    }
  }

  useFocusEffect(onNonExistentCollection)

  if ((isUpdatingCollection && collection) || !isUpdatingCollection) {
    return (
      <Layout testID="collection.editor.screen">
        <CollectionEditorForm collection={collection} onSubmit={onSubmit} />
      </Layout>
    )
  } else {
    /**
     * If the `collectionId` is defined and the collection is `null`, an alert
     * is displayed by the focus effect hook above.
     */
    return null
  }
}
