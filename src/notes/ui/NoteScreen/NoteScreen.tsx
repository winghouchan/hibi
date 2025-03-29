import { Trans, useLingui } from '@lingui/react/macro'
import { useSuspenseQuery } from '@tanstack/react-query'
import {
  Link,
  router,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router'
import { Alert, ScrollView } from 'react-native'
import { Text } from '@/ui'
import { noteQuery } from '../../operations'

export default function NoteScreen() {
  const { t: translate } = useLingui()
  const { id: noteId } = useLocalSearchParams<{ id?: string }>()
  const { data: note } = useSuspenseQuery(noteQuery(Number(noteId)))

  useFocusEffect(() => {
    if (!note) {
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
  })

  if (note) {
    return (
      <>
        <Stack.Screen
          options={{
            headerRight: () => (
              <Link href={`/notes/${noteId}/edit`}>
                <Trans>Edit</Trans>
              </Link>
            ),
          }}
        />
        <ScrollView testID="library.note.screen">
          <Text>{noteId}</Text>
          <Text>{JSON.stringify(note, null, 2)}</Text>
        </ScrollView>
      </>
    )
  } else {
    /**
     * If the note is `null`, it does not exist. An alert is displayed by the
     * focus effect hook above.
     */
    return null
  }
}
