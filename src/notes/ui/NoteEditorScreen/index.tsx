import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import type { NavigationProp } from '@react-navigation/native'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { router, Stack, useLocalSearchParams, useNavigation } from 'expo-router'
import { ComponentProps, ComponentRef, useEffect, useRef } from 'react'
import { Alert, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { log } from '@/telemetry'
import { Button } from '@/ui'
import {
  createNoteMutation,
  noteQuery,
  updateNoteMutation,
} from '../../operations'
import baseQueryKey from '../../operations/baseQueryKey'
import NoteEditor from '../NoteEditor'
import useDeepLinkHandler, { checkIsDeepLink } from './useDeepLinkHandler'

export default function NoteEditorScreen() {
  const { i18n } = useLingui()
  const safeAreaInsets = useSafeAreaInsets()
  const localSearchParams = useLocalSearchParams<{ id?: string }>()
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
      ? i18n.t(msg`There was an error updating the note`)
      : i18n.t(msg`There was an error creating the note`)

    const handlers: Parameters<Action>[1] = {
      async onSuccess({ id }) {
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
           * Navigate to the newly created note but set the library screen
           * to be the screen to be navigated to upon a back navigation. Not doing
           * this means a back navigation would take the user back to this screen
           * (the note creation screen) which is undesirable.
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
                name: 'note',
                state: {
                  index: 0,
                  routes: [{ name: '[id]/index', params: { id } }],
                },
              },
            ],
          })
        }
      },
      onError(error: Error) {
        Alert.alert(i18n.t(msg`Something went wrong`), errorMessage, [
          {
            text: i18n.t(msg`Try again`),
            style: 'default',
            isPreferred: true,
            onPress: async () => {
              await action(values as Parameters<Action>[0], handlers)
            },
          },
          {
            text: i18n.t(msg`Cancel`),
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
      Alert.alert(i18n.t(msg`The note doesn't exist`), '', [
        {
          text: i18n.t(msg`OK`),
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
      onPress={() => noteEditorRef.current?.submit()}
      testID="note.note-editor.cta"
    >
      {isUpdatingNote ? <Trans>Update note</Trans> : <Trans>Add note</Trans>}
    </Button>
  )

  useEffect(onNonExistentNote, [
    i18n,
    isDeepLink,
    isFetchingNote,
    isUpdatingNote,
    note,
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
          headerRight: () => <SubmitButton />,
        }}
      />
      <View
        style={{
          backgroundColor: 'white',
          flex: 1,
          paddingBottom: safeAreaInsets.bottom,
        }}
        testID="note-editor.screen"
      >
        <NoteEditor
          value={note}
          onSubmit={onSubmit}
          ref={noteEditorRef}
          testID="note"
        />
      </View>
    </>
  )
}
