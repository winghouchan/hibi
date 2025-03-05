import { Trans, useLingui } from '@lingui/react/macro'
import type {
  NavigationProp,
  PartialRoute,
  Route,
} from '@react-navigation/native'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { router, Stack, useLocalSearchParams, useNavigation } from 'expo-router'
import { ComponentProps, ComponentRef, useEffect, useRef } from 'react'
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
import styles from './styles'
import useDeepLinkHandler, { checkIsDeepLink } from './useDeepLinkHandler'

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
  const { data: note, isFetching: isFetchingNote } = useQuery(noteQueryOptions)
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
  const navigationState = navigation.getState()
  const isDeepLink = checkIsDeepLink(navigationState)

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
      async onSuccess({ id, collections }) {
        if (isUpdatingNote) {
          await queryClient.invalidateQueries({
            queryKey: noteQueryOptions.queryKey,
          })

          router.back()
        } else {
          await queryClient.invalidateQueries({
            queryKey: [baseQueryKey],
          })

          /**
           * Navigate to the newly created note but set the note's collection
           * screen (if it is in only one collection) or the library screen (if
           * it is in multiple collections) to be the screen to be navigated to
           * upon a back navigation. Not doing this means a back navigation
           * would take the user back to this screen (the note creation screen)
           * which is undesirable.
           */
          const routes = [
            {
              name: '(tabs)',
              state: {
                index: 1,
                routes: [{ name: 'index' }, { name: 'library/index' }],
              },
            },
            ...(collections.length === 1
              ? [
                  {
                    name: 'collection',
                    state: {
                      index: 0,
                      routes: [
                        {
                          name: '[id]/index',
                          params: { id: collections[0].id },
                        },
                      ],
                    },
                  },
                ]
              : []),
            {
              name: 'note',
              state: {
                index: 0,
                routes: [{ name: '[id]/index', params: { id } }],
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
    if (!note && !isFetchingNote && isUpdatingNote && !isDeepLink) {
      Alert.alert(translate`The note doesn't exist`, '', [
        {
          text: translate`OK`,
          style: 'default',
          onPress: () => {
            router.back()
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

  useEffect(onNonExistentNote, [
    isDeepLink,
    isFetchingNote,
    isUpdatingNote,
    note,
    translate,
  ])

  useDeepLinkHandler({
    note,
    isFetchingNote,
    isUpdatingNote,
  })

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
