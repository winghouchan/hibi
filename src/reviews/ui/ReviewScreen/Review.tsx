import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useMutation } from '@tanstack/react-query'
import { differenceInMilliseconds } from 'date-fns'
import { useState } from 'react'
import { Alert, Text, View } from 'react-native'
import { Grade, Rating } from 'ts-fsrs'
import { createReviewMutation, getNextReview } from '@/reviews/operations'
import { log } from '@/telemetry'
import { Button } from '@/ui'

interface Props
  extends Exclude<Awaited<ReturnType<typeof getNextReview>>, null> {
  onReview?: () => void
}

export default function Review({ id, fields, onReview }: Props) {
  const { i18n } = useLingui()
  const { mutateAsync: review } = useMutation(createReviewMutation)
  const [side, setSide] = useState(0)
  const [startTime] = useState(new Date())

  const createReviewHandler = (rating: Grade) =>
    async function handleReview() {
      try {
        await review({
          reviewable: id,
          rating,
          duration: differenceInMilliseconds(new Date(), startTime),
        })
        onReview?.()
      } catch (error) {
        Alert.alert(
          i18n.t(msg`Something went wrong`),
          i18n.t(msg`There was an error submitting your review`),
          [
            {
              text: i18n.t(msg`Try again`),
              style: 'default',
              isPreferred: true,
              onPress: async () => {
                await handleReview()
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

  return (
    <View style={{ height: '100%', width: '100%' }}>
      <Text>{JSON.stringify(fields[side], null, 2)}</Text>
      {side === 0 && (
        <Button onPress={() => setSide(1)} testID="review.show-answer">
          <Trans>Show answer</Trans>
        </Button>
      )}
      {side === 1 && (
        <View>
          <Button
            onPress={createReviewHandler(Rating.Again)}
            testID="review.rate.forgot"
          >
            <Trans>Forgot</Trans>
          </Button>
          <Button
            onPress={createReviewHandler(Rating.Hard)}
            testID="review.rate.hard"
          >
            <Trans>Hard</Trans>
          </Button>
          <Button
            onPress={createReviewHandler(Rating.Good)}
            testID="review.rate.good"
          >
            <Trans>Good</Trans>
          </Button>
          <Button
            onPress={createReviewHandler(Rating.Easy)}
            testID="review.rate.easy"
          >
            <Trans>Easy</Trans>
          </Button>
        </View>
      )}
    </View>
  )
}
