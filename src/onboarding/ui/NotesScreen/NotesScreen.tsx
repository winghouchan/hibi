import { useLingui } from '@lingui/react/macro'
import { type NavigationProp } from '@react-navigation/native'
import {
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { Link, Redirect, useNavigation } from 'expo-router'
import { Alert, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { notesQuery } from '@/notes/operations'
import { NoteList } from '@/notes/ui'
import { log } from '@/telemetry'
import { Button, Text } from '@/ui'
import {
  completeOnboardingMutation,
  isOnboardingCompleteQuery,
  onboardingCollectionQuery,
} from '../../operations'
import Layout from '../Layout'

const styles = StyleSheet.create(({ sizes, spacing }, { insets }) => ({
  padding: {
    paddingLeft: insets.left + spacing.normal,
    paddingRight: insets.right + spacing.normal,
  },
}))

export default function NotesScreen() {
  const { t: translate } = useLingui()
  const { data: collection } = useSuspenseQuery(onboardingCollectionQuery)
  const {
    data: notes,
    fetchNextPage: fetchMoreNotes,
    isFetchingNextPage: isFetchingMoreNotes,
  } = useSuspenseInfiniteQuery(
    notesQuery({
      filter: {
        collection:
          typeof collection?.id !== 'undefined' ? [collection.id] : undefined,
      },
      order: {
        id: 'desc',
      },
    }),
  )
  const navigation =
    useNavigation<NavigationProp<{ '(onboarded)': undefined }>>()
  const { mutateAsync: completeOnboarding } = useMutation(
    completeOnboardingMutation,
  )
  const queryClient = useQueryClient()

  const handleCompleteOnboarding = async () => {
    try {
      await completeOnboarding()

      await queryClient.invalidateQueries({
        queryKey: isOnboardingCompleteQuery.queryKey,
      })

      navigation.reset({
        index: 0,
        routes: [
          {
            name: '(onboarded)',
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

  if (collection) {
    return (
      <Layout testID="onboarding.notes.screen">
        <Layout.Main scrollable={false}>
          <Text
            size="heading"
            style={styles.padding}
          >{translate`What do you want to remember?`}</Text>
          <NoteList
            data={notes}
            onEndReached={() => !isFetchingMoreNotes && fetchMoreNotes()}
            renderItem={({ item: note }) => (
              <Link key={note.id} href={`/onboarding/notes/${note.id}/edit`}>
                <NoteList.Item fields={note.fields} />
              </Link>
            )}
          />
        </Layout.Main>
        <Layout.Footer>
          {notes?.length ? (
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
    )
  } else {
    return <Redirect href="/" />
  }
}
