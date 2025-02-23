import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useQuery } from '@tanstack/react-query'
import { Link, router, Stack, useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'
import { Alert, ScrollView } from 'react-native'
import { Text } from '@/ui'
import { noteQuery } from '../../operations'

export default function NoteScreen() {
  const { i18n } = useLingui()
  const { id: noteId } = useLocalSearchParams<{ id?: string }>()
  const { data: note, isPending: isNotePending } = useQuery(
    noteQuery(Number(noteId)),
  )

  useEffect(() => {
    if (!note && !isNotePending) {
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
  }, [i18n, isNotePending, note])

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Link href={`/note/${noteId}/edit`}>
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
}
