import { useLingui } from '@lingui/react/macro'
import type {
  NavigationProp,
  PartialRoute,
  Route,
} from '@react-navigation/native'
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import {
  router,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from 'expo-router'
import { ComponentProps, ComponentRef, useRef } from 'react'
import { Alert, View } from 'react-native'
import { log } from '@/telemetry'
import { Button } from '@/ui'
import {
  createNoteMutation,
  noteQuery,
  updateNoteMutation,
} from '../../operations'
import baseQueryKey from '../../operations/baseQueryKey'
import NoteEditor from '../NoteEditor'
import styles from './NoteEditorScreen.styles'

export default function NoteEditorScreen() {
  const { t: translate } = useLingui()
  const localSearchParams = useLocalSearchParams<{
    id?: string
    collections: string
  }>()
  const collections =
    typeof localSearchParams.collections !== 'undefined'
      ? localSearchParams.collections.split(',').map(Number)
      : undefined
  const noteId =
    typeof localSearchParams.id !== 'undefined'
      ? Number(localSearchParams.id)
      : undefined
  const isUpdatingNote = typeof noteId !== 'undefined'
  const noteQueryOptions = noteQuery(noteId)
  const queryClient = useQueryClient()
  const { data: note } = useSuspenseQuery(noteQueryOptions)
  const { mutateAsync: createNote } = useMutation(createNoteMutation)
  const { mutateAsync: updateNote } = useMutation(updateNoteMutation)
  const noteEditorRef = useRef<ComponentRef<typeof NoteEditor>>(null)
  const navigation = useNavigation<
    NavigationProp<{
      '(tabs)': undefined
      collection: undefined
      note: undefined
    }>
  >('/(app)')

  const onSubmit: ComponentProps<typeof NoteEditor>['onSubmit'] = async (
    values,
  ) => {
    type Action = typeof isUpdatingNote extends true
      ? typeof updateNote
      : typeof createNote

    const action = (isUpdatingNote ? updateNote : createNote) as Action

    const errorMessage = isUpdatingNote
      ? translate`There was an error updating the note`
      : translate`There was an error creating the note`

    const handlers: Parameters<Action>[1] = {
      async onSuccess({ id }) {
        const navigationState = navigation.getState()

        await queryClient.invalidateQueries({
          queryKey: [baseQueryKey],
        })

        if (isUpdatingNote) {
          router.back()
        } else {
          /**
           * Navigate to the newly created note but remove the editor screen from
           * the history
           */
          const routes = [
            navigationState.routes[0],
            ...(navigationState.routes[1]?.name === 'collection'
              ? [navigationState.routes[1]]
              : []),
            {
              name: 'notes',
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
          ] as PartialRoute<
            Route<'(tabs)' | 'collection' | 'note', undefined>
          >[]

          navigation.reset({
            index: routes.length - 1,
            routes,
          })
        }
      },
      onError(error: Error) {
        Alert.alert(translate`Something went wrong`, errorMessage, [
          {
            text: translate`Try again`,
            style: 'default',
            isPreferred: true,
            onPress: async () => {
              await action(values as Parameters<Action>[0], handlers)
            },
          },
          {
            text: translate`Cancel`,
            style: 'cancel',
          },
        ])
        log.error(error)
      },
    }

    try {
      await action(values as Parameters<Action>[0], handlers)
    } catch {
      // Errors handled in `handlers`
    }
  }

  const onNonExistentNote = () => {
    if (!note && isUpdatingNote) {
      Alert.alert(translate`The note doesn't exist`, '', [
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

  const SubmitButton = () => (
    <Button
      action="primary"
      priority="low"
      onPress={() => noteEditorRef.current?.submit()}
      size="small"
      testID="note.note-editor.cta"
    >
      {isUpdatingNote ? translate`Update` : translate`Add`}
    </Button>
  )

  useFocusEffect(onNonExistentNote)

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View>
              <SubmitButton />
            </View>
          ),
        }}
      />
      <View style={styles.screen} testID="note-editor.screen">
        <NoteEditor
          value={{ collections, ...note }}
          onSubmit={onSubmit}
          ref={noteEditorRef}
          testID="note"
        />
      </View>
    </>
  )
}
