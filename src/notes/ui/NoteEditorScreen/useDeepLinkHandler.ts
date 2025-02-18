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
    navigationState?.routes?.[0]?.state?.index !== 1 &&
    navigationState?.routes?.[0]?.state?.routes?.[1]?.name !== 'library/index'
  )
}

function createNavigationHistory({
  noteExists,
  isUpdatingNote,
  params,
}: {
  noteExists: boolean
  isUpdatingNote: boolean
  params: ReturnType<typeof useLocalSearchParams>
}): PartialState<NavigationState<{ '(tabs)': undefined; note: undefined }>> {
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
      isUpdatingNote
        ? {
            name: 'note',
            params,
            ...(noteExists
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
            name: 'note',
            params,
            state: {
              index: 0,
              routes: [{ name: 'new', params }],
            },
          },
    ],
  }
}

export default function useDeepLinkHandler({
  note,
  isFetchingNote,
  isUpdatingNote,
}: {
  note?: object | null
  isFetchingNote: boolean
  isUpdatingNote: boolean
}) {
  const navigation =
    useNavigation<NavigationProp<{ '(tabs)': undefined; note: undefined }>>(
      '/(app)',
    )
  const state = navigation.getState()
  const isDeepLink = checkIsDeepLink(state)
  const params = useLocalSearchParams()

  useFocusEffect(() => {
    if (isDeepLink && note !== undefined && !isFetchingNote) {
      navigation.reset(
        createNavigationHistory({
          noteExists: note !== null,
          isUpdatingNote: isUpdatingNote,
          params,
        }),
      )
    }
  })
}
