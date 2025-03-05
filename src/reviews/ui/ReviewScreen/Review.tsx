import { useLingui } from '@lingui/react/macro'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Alert, View } from 'react-native'
import { Grade, Rating } from 'ts-fsrs'
import { createReviewMutation, getNextReview } from '@/reviews/operations'
import { log } from '@/telemetry'
import { Button, Text } from '@/ui'
import useTimer from './useTimer'

interface Props
  extends Exclude<Awaited<ReturnType<typeof getNextReview>>, null> {
  onReview?: () => void
}

export default function Review({ id, fields, onReview }: Props) {
  const { t: translate } = useLingui()
  const { mutateAsync: review } = useMutation(createReviewMutation)
  const [side, setSide] = useState(0)
  const { duration, stop } = useTimer({ start: true })

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
    <View style={{ height: '100%', width: '100%' }}>
      <Text>{JSON.stringify(fields[side], null, 2)}</Text>
      {side === 0 && (
        <Button onPress={showAnswer} testID="review.show-answer">
          {translate`Show answer`}
        </Button>
      )}
      {side === 1 && (
        <View>
          <Button
            action="neutral"
            priority="low"
            onPress={createReviewHandler(Rating.Again)}
            testID="review.rate.forgot"
          >
            {translate`Forgot`}
          </Button>
          <Button
            action="neutral"
            priority="low"
            onPress={createReviewHandler(Rating.Hard)}
            testID="review.rate.hard"
          >
            {translate`Hard`}
          </Button>
          <Button
            action="neutral"
            priority="low"
            onPress={createReviewHandler(Rating.Good)}
            testID="review.rate.good"
          >
            {translate`Good`}
          </Button>
          <Button
            action="neutral"
            priority="low"
            onPress={createReviewHandler(Rating.Easy)}
            testID="review.rate.easy"
          >
            {translate`Easy`}
          </Button>
        </View>
      )}
    </View>
  )
}
