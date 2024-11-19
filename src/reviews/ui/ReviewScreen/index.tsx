import { Trans } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import PagerView from 'react-native-pager-view'
import { nextReviewQuery } from '@/reviews/operations'
import Review from './Review'
import ReviewFinished from './ReviewFinished'

export default function ReviewScreen() {
  const { data: nextReview, refetch } = useQuery(nextReviewQuery)
  const pagerViewRef = useRef<PagerView>(null)
  const initialPage = 0
  const [page, setPage] = useState(initialPage)
  const [reviewables, setReviewables] = useState<(typeof nextReview)[]>([])

  const onNextReview = () => {
    setReviewables((state) => {
      const newState =
        state.at(-1)?.id !== nextReview?.id ? [...state, nextReview] : state

      setPage(newState.length - 1)

      return newState
    })
  }

  const onPageChange = () => {
    pagerViewRef.current?.setPage(page)
  }

  const onReview = async () => {
    await refetch()
  }

  useEffect(onNextReview, [nextReview])

  useEffect(onPageChange, [page])

  return (
    <View testID="review.screen" style={{ flex: 1 }}>
      <View>
        <Trans>Review Screen</Trans>
      </View>
      {reviewables.length > 0 && (
        <PagerView
          initialPage={initialPage}
          ref={pagerViewRef}
          scrollEnabled={false}
          style={{ flex: 1 }}
        >
          {reviewables.map((reviewable, index) =>
            reviewable ? (
              <Review key={index} {...reviewable} onReview={onReview} />
            ) : (
              <ReviewFinished key={index} />
            ),
          )}
        </PagerView>
      )}
    </View>
  )
}
