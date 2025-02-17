import type {
  NavigationProp,
  NavigationState,
  PartialState,
} from '@react-navigation/native'
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from 'expo-router'

export function checkIsDeepLink(navigationState: NavigationState): boolean {
  return (
    navigationState?.routes?.[0]?.state?.routes?.[1]?.name !== 'library/index'
  )
}

function createNavigationHistory({
  collectionExists,
  isUpdatingCollection,
  params,
}: {
  collectionExists: boolean
  isUpdatingCollection: boolean
  params: ReturnType<typeof useLocalSearchParams>
}): PartialState<
  NavigationState<{ '(tabs)': undefined; collection: undefined }>
> {
  return {
    index: 1,
    routes: [
      {
        name: '(tabs)',
        state: {
          index: 1,
          routes: [{ name: 'index' }, { name: 'library/index' }],
        },
      },
      isUpdatingCollection
        ? {
            name: 'collection',
            params,

            ...(collectionExists
              ? {
                  state: {
                    index: 1,
                    routes: [
                      { name: '[id]/index', params },
                      { name: '[id]/edit', params },
                    ],
                  },
                }
              : {
                  state: {
                    index: 0,
                    routes: [{ name: '[id]/edit', params }],
                  },
                }),
          }
        : {
            name: 'collection',
            params,
            state: {
              index: 0,
              routes: [{ name: 'new', params }],
            },
          },
    ],
  }
}

/**
 * Populates the navigation history when the screen is navigated to via a deep link
 */
export default function useDeepLinkHandler({
  collection,
  isFetchingCollection,
  isUpdatingCollection,
}: {
  collection?: object | null
  isFetchingCollection: boolean
  isUpdatingCollection: boolean
}) {
  const navigation = useNavigation<
    NavigationProp<{
      '(tabs)': undefined
      collection: undefined
    }>
  >('/(app)')
  const state = navigation.getState()
  const isDeepLink = checkIsDeepLink(state)
  const params = useLocalSearchParams()

  useFocusEffect(() => {
    if (isDeepLink && collection !== undefined && !isFetchingCollection) {
      navigation.reset(
        createNavigationHistory({
          collectionExists: collection !== null,
          isUpdatingCollection: isUpdatingCollection,
          params,
        }),
      )
    }
  })
}
