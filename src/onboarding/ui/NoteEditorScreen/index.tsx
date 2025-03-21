import { useLingui } from '@lingui/react/macro'
import { useQuery } from '@tanstack/react-query'
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { ComponentRef, useRef } from 'react'
import { Alert, View } from 'react-native'
import { noteQuery } from '@/notes/operations'
import { NoteEditor } from '@/notes/ui'
import { Button } from '@/ui'
import { onboardingCollectionQuery } from '../../operations'
import styles from './styles'
import useForm from './useForm'
import useHandleNonExistentNote from './useHandleNonExistentNote'

export default function NoteEditorScreen() {
  const noteEditorRef = useRef<ComponentRef<typeof NoteEditor>>(null)
  const { t: translate } = useLingui()
  const { id: noteId } = useLocalSearchParams<{ id?: string }>()
  const isUpdatingNote = typeof noteId !== 'undefined'
  const router = useRouter()
  const { data: collection, isFetching: isFetchingCollection } = useQuery(
    onboardingCollectionQuery,
  )
  const { data: note, isFetching: isFetchingNote } = useQuery(
    noteQuery(Number(noteId)),
  )

  const { handleSubmit } = useForm({
    onSubmitSuccess: () => {
      router.back()
    },
    onSubmitError: (error, retry) => {
      const errorMessage =
        typeof note?.id === 'undefined'
          ? translate`There was an error creating the note`
          : translate`There was an error updating the note`

      Alert.alert(translate`Something went wrong`, errorMessage, [
        {
          text: translate`Try again`,
          style: 'default',
          isPreferred: true,
          onPress: retry,
        },
        {
          text: translate`Cancel`,
          style: 'cancel',
        },
      ])
    },
  })

  const SubmitButton = () => (
    <Button
      action="primary"
      priority="low"
      onPress={() => noteEditorRef.current?.submit()}
      size="small"
      testID="onboarding.note-editor.cta"
    >
      {typeof note?.id === 'undefined' ? translate`Add` : translate`Update`}
    </Button>
  )

  useHandleNonExistentNote(
    !Boolean(collection && isUpdatingNote && !isFetchingNote && note === null),
    () => {
      router.back()
    },
  )

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
      <View style={styles.screen} testID="onboarding.note-editor.screen">
        <NoteEditor
          value={{ ...note, collections: [collection.id] }}
          onSubmit={handleSubmit}
          ref={noteEditorRef}
          testID="onboarding"
        />
      </View>
    </>
  ) : !collection && !isFetchingCollection ? (
    <Redirect href="/" />
  ) : null
}
