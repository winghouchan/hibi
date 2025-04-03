import { useLingui } from '@lingui/react/macro'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Alert, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { Grade, Rating } from 'ts-fsrs'
import { createReviewMutation, getNextReviews } from '@/reviews/operations'
import { log } from '@/telemetry'
import { Button, Text } from '@/ui'
import Layout from '../Layout'
import useTimer from './useTimer'

type Props = Awaited<
  ReturnType<typeof getNextReviews>
>['reviewables'][number] & {
  active: boolean
  onReview?: () => void
}

const styles = StyleSheet.create(() => ({
  buttonContainer: {
    flex: 1,
  },
}))

export default function Review({ active, id, fields, onReview }: Props) {
  const { t: translate } = useLingui()
  const { mutateAsync: review } = useMutation(createReviewMutation)
  const [side, setSide] = useState(0)
  const { duration, stop } = useTimer({ start: active })

  const showAnswer = () => {
    setSide(1)
    stop()
  }

  const createReviewHandler = (rating: Grade) =>
    async function handleReview() {
      try {
        await review({
          reviewable: id,
          rating,
          duration,
        })
        onReview?.()
      } catch (error) {
        Alert.alert(
          translate`Something went wrong`,
          translate`There was an error submitting your review`,
          [
            {
              text: translate`Try again`,
              style: 'default',
              isPreferred: true,
              onPress: async () => {
                await handleReview()
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

  return (
    <>
      <Layout.Main>
        <Text>{JSON.stringify(fields[side], null, 2)}</Text>
      </Layout.Main>
      <Layout.Footer>
        {side === 0 && (
          <Button onPress={showAnswer} testID="review.show-answer">
            {translate`Show answer`}
          </Button>
        )}
        {side === 1 && (
          <View style={{ flexDirection: 'row' }}>
            <View style={styles.buttonContainer}>
              <Button
                action="neutral"
                priority="low"
                onPress={createReviewHandler(Rating.Again)}
                testID="review.rate.forgot"
              >
                {translate`Forgot`}
              </Button>
            </View>
            <View style={styles.buttonContainer}>
              <Button
                action="neutral"
                priority="low"
                onPress={createReviewHandler(Rating.Hard)}
                testID="review.rate.hard"
              >
                {translate`Hard`}
              </Button>
            </View>
            <View style={styles.buttonContainer}>
              <Button
                action="neutral"
                priority="low"
                onPress={createReviewHandler(Rating.Good)}
                testID="review.rate.good"
              >
                {translate`Good`}
              </Button>
            </View>
            <View style={styles.buttonContainer}>
              <Button
                action="neutral"
                priority="low"
                onPress={createReviewHandler(Rating.Easy)}
                testID="review.rate.easy"
              >
                {translate`Easy`}
              </Button>
            </View>
          </View>
        )}
      </Layout.Footer>
    </>
  )
}
