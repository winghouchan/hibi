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
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from 'expo-router'
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

export default function NoteEditorScreen() {
  const { i18n } = useLingui()
  const safeAreaInsets = useSafeAreaInsets()
  const localSearchParams = useLocalSearchParams<{ id?: string }>()
  const { id: noteId } = localSearchParams
  const navigation = useNavigation<
    NavigationProp<{
      '(tabs)': undefined
    }>
  >('/(app)')
  const noteQueryOptions = noteQuery(Number(noteId))
  const {
    data: note,
    isPending: isNotePending,
    error,
  } = useQuery(noteQueryOptions)
  const queryClient = useQueryClient()
  const { mutateAsync: createNote } = useMutation(createNoteMutation)
  const { mutateAsync: updateNote } = useMutation(updateNoteMutation)
  const noteEditorRef = useRef<ComponentRef<typeof NoteEditor>>(null)

  const onSubmit: ComponentProps<typeof NoteEditor>['onSubmit'] = async (
    values,
  ) => {
    const isUpdating = 'id' in values && values.id !== undefined

    type Action = typeof isUpdating extends true
      ? typeof updateNote
      : typeof createNote

    type Values = typeof isUpdating extends true
      ? Parameters<typeof updateNote>[0]
      : Parameters<typeof createNote>[0]

    type Handlers = typeof isUpdating extends true
      ? Parameters<typeof updateNote>[1]
      : Parameters<typeof createNote>[1]

    const action = (isUpdating ? updateNote : createNote) as Action

    const errorMessage = isUpdating
      ? i18n.t(msg`There was an error updating the note`)
      : i18n.t(msg`There was an error creating the note`)

    const handlers: Handlers = {
      async onSuccess() {
        await queryClient.invalidateQueries({
          queryKey: isUpdating ? noteQueryOptions.queryKey : [baseQueryKey],
        })
        router.back()
      },
      onError(error: Error) {
        Alert.alert(i18n.t(msg`Something went wrong`), errorMessage, [
          {
            text: i18n.t(msg`Try again`),
            style: 'default',
            isPreferred: true,
            onPress: async () => {
              await action(values as Values, handlers)
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
      await action(values as Values, handlers)
    } catch {
      // Errors handled in `handlers`
    }
  }

  const SubmitButton = () => (
    <Button
      onPress={() => noteEditorRef.current?.submit()}
      testID="note.note-editor.cta"
    >
      {note?.id ? <Trans>Update note</Trans> : <Trans>Add note</Trans>}
    </Button>
  )

  useEffect(() => {
    if (!note && !isNotePending && !error) {
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
  }, [error, i18n, isNotePending, note])

  useFocusEffect(() => {
    const state = navigation.getState()

    if (
      typeof noteId !== 'undefined' &&
      state?.routes?.[0]?.state?.index !== 1 &&
      state?.routes?.[0]?.state?.routes?.[1]?.name !== 'library/index'
    ) {
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
            params: localSearchParams,
            state: {
              index: 1,
              routes: [
                {
                  name: '[id]/index',
                  params: localSearchParams,
                },
                {
                  name: '[id]/edit',
                  params: localSearchParams,
                },
              ],
            },
          },
        ] as PartialRoute<Route<'(tabs)', undefined>>[],
      })
    }
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
