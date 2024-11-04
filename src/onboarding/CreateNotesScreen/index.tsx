import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { type NavigationProp } from '@react-navigation/native'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, Redirect, useNavigation } from 'expo-router'
import { Alert, Pressable, View } from 'react-native'
import { log } from '@/telemetry'
import { completeOnboardingMutation } from '../completeOnboarding'
import { onboardingCollectionQuery } from '../onboardingCollection'

export default function CreateNotesScreen() {
  const { i18n } = useLingui()
  const { data: collection, isFetching } = useQuery(onboardingCollectionQuery)
  const navigation = useNavigation<NavigationProp<{ '(app)': undefined }>>()
  const { mutateAsync: completeOnboarding } = useMutation(
    completeOnboardingMutation,
  )

  const handleCompleteOnboarding = async () => {
    try {
      await completeOnboarding()

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
    } catch (error) {
      Alert.alert(
        i18n.t(msg`Something went wrong`),
        i18n.t(msg`There was an error completing onboarding`),
        [
          {
            text: i18n.t(msg`Try again`),
            style: 'default',
            isPreferred: true,
            onPress: async () => {
              await handleCompleteOnboarding()
            },
          },
          {
            text: i18n.t(msg`Cancel`),
            style: 'cancel',
          },
        ],
      )

      log.error(error)
    }
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
            onPress={() => handleCompleteOnboarding()}
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
