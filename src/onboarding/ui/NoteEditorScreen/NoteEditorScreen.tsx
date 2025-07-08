import { useLingui } from '@lingui/react/macro'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import { ComponentRef, useRef } from 'react'
import { Alert, Pressable, View } from 'react-native'
import { noteQuery } from '@/notes/operations'
import { NoteEditor } from '@/notes/ui'
import { Button, Heading, Icon, Stack } from '@/ui'
import { onboardingCollectionQuery } from '../../operations'
import Header from './Header'
import styles from './NoteEditorScreen.styles'
import useForm from './useForm'
import useHandleNonExistentNote from './useHandleNonExistentNote'

export default function NoteEditorScreen() {
  const noteEditorRef = useRef<ComponentRef<typeof NoteEditor>>(null)
  const { t: translate } = useLingui()
  const localSearchParams = useLocalSearchParams<{ id?: string }>()
  const noteId =
    typeof localSearchParams.id !== 'undefined'
      ? Number(localSearchParams.id)
      : undefined
  const isUpdatingNote = typeof noteId !== 'undefined'
  const router = useRouter()
  const { data: collection } = useSuspenseQuery(onboardingCollectionQuery)
  const { data: note } = useSuspenseQuery(noteQuery(noteId))

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

  useHandleNonExistentNote(
    !Boolean(collection && isUpdatingNote && note === null),
    () => {
      router.back()
    },
  )

  if (collection) {
    return (
      <>
        <Stack.Screen
          options={{
            header: ({ navigation }) => (
              <Header>
                <Header.Item>
                  {navigation.canGoBack() ? (
                    <View>
                      <Pressable
                        accessibilityLabel={translate`Close`}
                        accessibilityRole="button"
                        onPress={() => navigation.goBack()}
                      >
                        <Icon name="x" size={32} />
                      </Pressable>
                    </View>
                  ) : null}
                  <Heading size="small">{collection.name}</Heading>
                </Header.Item>
                <View>
                  <Button
                    action="primary"
                    priority="high"
                    onPress={() => noteEditorRef.current?.submit()}
                    size="small"
                    testID="onboarding.note-editor.cta"
                  >
                    {typeof note?.id === 'undefined'
                      ? translate`Add`
                      : translate`Update`}
                  </Button>
                </View>
              </Header>
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
    )
  } else {
    return <Redirect href="/" />
  }
}
