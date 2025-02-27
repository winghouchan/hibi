import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { ComponentProps, ComponentRef, useEffect, useRef } from 'react'
import { Alert, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  createNoteMutation,
  NoteEditor,
  noteQuery,
  updateNoteMutation,
} from '@/notes'
import { log } from '@/telemetry'
import { Button } from '@/ui'
import { onboardingCollectionQuery } from '../../operations'

export default function NoteEditorScreen() {
  const noteEditorRef = useRef<ComponentRef<typeof NoteEditor>>(null)
  const { i18n } = useLingui()
  const { id: noteId } = useLocalSearchParams<{ id?: string }>()
  const queryClient = useQueryClient()
  const router = useRouter()
  const { data: collection, isFetching: isFetchingCollection } = useQuery(
    onboardingCollectionQuery,
  )
  const { data: note, isFetching: isFetchingNote } = useQuery(
    noteQuery(Number(noteId)),
  )
  const { mutateAsync: createNote } = useMutation(createNoteMutation)
  const { mutateAsync: updateNote } = useMutation(updateNoteMutation)
  const safeAreaInsets = useSafeAreaInsets()

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
          queryKey: onboardingCollectionQuery.queryKey,
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
      action="primary"
      priority="low"
      onPress={() => noteEditorRef.current?.submit()}
      size="small"
      testID="onboarding.note-editor.cta"
    >
      {note?.id ? (
        <Trans component={null}>Update</Trans>
      ) : (
        <Trans component={null}>Add</Trans>
      )}
    </Button>
  )

  useEffect(() => {
    if (
      collection &&
      typeof noteId !== 'undefined' &&
      !isFetchingNote &&
      note === null
    ) {
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
  }, [collection, i18n, isFetchingNote, note, noteId, router])

  return collection && !isFetchingCollection ? (
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
      <View
        style={{
          backgroundColor: 'white',
          flex: 1,
          paddingBottom: safeAreaInsets.bottom,
        }}
        testID="onboarding.note-editor.screen"
      >
        <NoteEditor
          value={{ ...note, collections: [collection.id] }}
          onSubmit={onSubmit}
          ref={noteEditorRef}
          testID="onboarding"
        />
      </View>
    </>
  ) : !collection && !isFetchingCollection ? (
    <Redirect href="/" />
  ) : null
}
