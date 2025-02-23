import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { type NavigationProp } from '@react-navigation/native'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, Redirect, useNavigation } from 'expo-router'
import { Alert } from 'react-native'
import { log } from '@/telemetry'
import { Button } from '@/ui'
import {
  completeOnboardingMutation,
  onboardingCollectionQuery,
} from '../../operations'
import Layout from '../Layout'

export default function NotesScreen() {
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
            state: {
              index: 0,
              routes: [
                {
                  name: '(tabs)',
                  params: {
                    screen: 'index',
                  },
                },
              ],
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
    <Layout testID="onboarding.notes.screen">
      <Layout.Main>
        {collection.notes.map((note) => (
          <Link key={note.id} href={`/onboarding/notes/edit/${note.id}`}>
            {JSON.stringify(note, null, 2)}
          </Link>
        ))}
      </Layout.Main>
      <Layout.Footer>
        {collection.notes.length ? (
          <>
            <Link href="/onboarding/notes/new">
              <Trans>Add another note</Trans>
            </Link>
            <Button
              onPress={() => handleCompleteOnboarding()}
              testID="onboarding.notes.cta"
            >
              <Trans>Finish</Trans>
            </Button>
          </>
        ) : (
          <Link
            href="/onboarding/notes/new"
            testID="onboarding.notes.new-note.button"
          >
            <Trans>New note</Trans>
          </Link>
        )}
      </Layout.Footer>
    </Layout>
  ) : !collection && !isFetching ? (
    <Redirect href="/" />
  ) : null
}
