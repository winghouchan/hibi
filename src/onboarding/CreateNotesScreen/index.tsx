import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { type NavigationProp } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { Link, Redirect, useNavigation } from 'expo-router'
import { useEffect } from 'react'
import { Alert, Pressable, View } from 'react-native'
import { onboardingCollectionQuery } from '../onboardingCollection'

export default function CreateNotesScreen() {
  const { i18n } = useLingui()
  const {
    data: collection,
    error,
    isFetching,
    refetch: refetchOnboardingCollection,
  } = useQuery(onboardingCollectionQuery)
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

  useEffect(() => {
    if (!isFetching && error) {
      // @todo Handle error
      Alert.alert(
        i18n.t(msg`Something went wrong`),
        i18n.t(msg`There was a failure getting your onboarding collection`),
        [
          {
            text: i18n.t(msg`Try again`),
            style: 'default',
            isPreferred: true,
            onPress: () => {
              refetchOnboardingCollection()
            },
          },
          {
            text: i18n.t(msg`Cancel`),
            style: 'cancel',
          },
        ],
      )
      console.error(error)
    }
  }, [error, i18n, isFetching, refetchOnboardingCollection])

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
