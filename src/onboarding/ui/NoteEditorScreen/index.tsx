import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useQuery } from '@tanstack/react-query'
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { ComponentRef, useEffect, useRef } from 'react'
import { Alert, View } from 'react-native'
import { NoteEditor, noteQuery } from '@/notes'
import { Button } from '@/ui'
import { onboardingCollectionQuery } from '../../operations'
import styles from './styles'
import useForm from './useForm'

export default function NoteEditorScreen() {
  const noteEditorRef = useRef<ComponentRef<typeof NoteEditor>>(null)
  const { i18n } = useLingui()
  const { id: noteId } = useLocalSearchParams<{ id?: string }>()
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
          ? i18n.t(msg`There was an error creating the note`)
          : i18n.t(msg`There was an error updating the note`)

      Alert.alert(i18n.t(msg`Something went wrong`), errorMessage, [
        {
          text: i18n.t(msg`Try again`),
          style: 'default',
          isPreferred: true,
          onPress: retry,
        },
        {
          text: i18n.t(msg`Cancel`),
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
      {typeof note?.id === 'undefined' ? (
        <Trans component={null}>Add</Trans>
      ) : (
        <Trans component={null}>Update</Trans>
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
