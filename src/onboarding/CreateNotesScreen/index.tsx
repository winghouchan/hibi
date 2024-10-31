import { Trans } from '@lingui/macro'
import { type NavigationProp } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { Link, Redirect, useNavigation } from 'expo-router'
import { Pressable, View } from 'react-native'
import { onboardingCollectionQuery } from '../onboardingCollection'

export default function CreateNotesScreen() {
  const { data: collection, isFetching } = useQuery(onboardingCollectionQuery)
  const navigation = useNavigation<NavigationProp<{ '(app)': undefined }>>()

  const completeOnboarding = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: '(app)',
          params: {
            screen: 'index',
          },
        },
      ],
    })
  }

  return collection && !isFetching ? (
    <View testID="onboarding.notes.screen">
      {collection.notes.map((note) => (
        <Link key={note.id} href={`/onboarding/notes/edit/${note.id}`}>
          {JSON.stringify(note, null, 2)}
        </Link>
      ))}
      {collection.notes.length ? (
        <>
          <Link href="/onboarding/notes/new">
            <Trans>Add another note</Trans>
          </Link>
          <Pressable
            accessibilityRole="button"
            onPress={() => completeOnboarding()}
            testID="onboarding.notes.cta.button"
          >
            <Trans>Finish</Trans>
          </Pressable>
        </>
      ) : (
        <Link
          href="/onboarding/notes/new"
          testID="onboarding.notes.new-note.button"
        >
          <Trans>New note</Trans>
        </Link>
      )}
    </View>
  ) : !collection && !isFetching ? (
    <Redirect href="/" />
  ) : null
}
