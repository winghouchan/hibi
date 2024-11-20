import { Trans } from '@lingui/macro'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { View } from 'react-native'
import PagerView from 'react-native-pager-view'
import { nextReviewQuery } from '@/reviews/operations'
import Review from './Review'
import ReviewFinished from './ReviewFinished'

export default function ReviewScreen() {
  const initialPage = 0
  const pagerViewRef = useRef<PagerView>(null)
  const query = nextReviewQuery({ onlyDue: true })
  const { data, fetchNextPage } = useInfiniteQuery(query)

  const onNewPage = () => {
    data?.pages.length && pagerViewRef.current?.setPage(data.pages.length - 1)
  }

  const onReview = async () => {
    await fetchNextPage()
  }

  useEffect(onNewPage, [data?.pages.length])

  return (
    <View testID="review.screen" style={{ flex: 1 }}>
      <View>
        <Trans>Review Screen</Trans>
      </View>
      {(data?.pages.length ?? 0) > 0 && (
        <PagerView
          initialPage={initialPage}
          ref={pagerViewRef}
          scrollEnabled={false}
          style={{ flex: 1 }}
        >
          {data?.pages.map((reviewable, index) =>
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
