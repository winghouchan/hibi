import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { type NavigationProp } from '@react-navigation/native'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, Redirect, useNavigation } from 'expo-router'
import { Alert, View } from 'react-native'
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
          <View style={{ gap: 12 }}>
            <Link asChild href="/onboarding/notes/new">
              <Button action="neutral" priority="medium">
                <Trans component={null}>Add another note</Trans>
              </Button>
            </Link>
            <Button
              onPress={() => handleCompleteOnboarding()}
              testID="onboarding.notes.cta"
            >
              <Trans component={null}>Finish</Trans>
            </Button>
          </View>
        ) : (
          <Link
            asChild
            href="/onboarding/notes/new"
            testID="onboarding.notes.new-note"
          >
            <Button>
              <Trans component={null}>New note</Trans>
            </Button>
          </Link>
        )}
      </Layout.Footer>
    </Layout>
  ) : !collection && !isFetching ? (
    <Redirect href="/" />
  ) : null
}
