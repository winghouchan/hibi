import { useLingui } from '@lingui/react/macro'
import { type NavigationProp } from '@react-navigation/native'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, Redirect, useNavigation } from 'expo-router'
import { Alert, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { log } from '@/telemetry'
import { Button, Text } from '@/ui'
import {
  completeOnboardingMutation,
  onboardingCollectionQuery,
} from '../../operations'
import Layout from '../Layout'
import List from './List'

const styles = StyleSheet.create(({ spacing }, { insets }) => ({
  padding: {
    paddingLeft: insets.left + spacing[4],
    paddingRight: insets.right + spacing[4],
  },
}))

export default function NotesScreen() {
  const { t: translate } = useLingui()
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
        translate`Something went wrong`,
        translate`There was an error completing onboarding`,
        [
          {
            text: translate`Try again`,
            style: 'default',
            isPreferred: true,
            onPress: async () => {
              await handleCompleteOnboarding()
            },
          },
          {
            text: translate`Cancel`,
            style: 'cancel',
          },
        ],
      )

      log.error(error)
    }
  }

  return collection && !isFetching ? (
    <Layout testID="onboarding.notes.screen">
      <Layout.Main scrollable={false}>
        <Text
          size="heading"
          style={styles.padding}
        >{translate`What do you want to remember?`}</Text>
        <List data={collection.notes} />
      </Layout.Main>
      <Layout.Footer>
        {collection.notes.length ? (
          <View style={{ gap: 12 }}>
            <Link asChild href="/onboarding/notes/new">
              <Button action="neutral" priority="medium">
                {translate`Add another note`}
              </Button>
            </Link>
            <Button
              onPress={() => handleCompleteOnboarding()}
              testID="onboarding.notes.cta"
            >
              {translate`Finish`}
            </Button>
          </View>
        ) : (
          <Link
            asChild
            href="/onboarding/notes/new"
            testID="onboarding.notes.new-note"
          >
            <Button>{translate`New note`}</Button>
          </Link>
        )}
      </Layout.Footer>
    </Layout>
  ) : !collection && !isFetching ? (
    <Redirect href="/" />
  ) : null
}
