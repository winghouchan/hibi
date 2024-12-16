import { Trans } from '@lingui/macro'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigation } from 'expo-router'
import { useEffect, useRef } from 'react'
import { View } from 'react-native'
import PagerView from 'react-native-pager-view'
import { nextReviewQuery } from '@/reviews/operations'
import Review from './Review'
import ReviewFinished from './ReviewFinished'

export default function ReviewScreen() {
  const initialPage = 0
  const navigation = useNavigation()
  const queryClient = useQueryClient()
  const pagerViewRef = useRef<PagerView>(null)
  const query = nextReviewQuery({ onlyDue: true })
  const { data, fetchNextPage } = useInfiniteQuery(query)

  const onNewPage = () => {
    // Set the current page of the pager view to the last page after it has rendered
    setTimeout(() => {
      data?.pages.length && pagerViewRef.current?.setPage(data.pages.length - 1)
    }, 0)
  }

  const onReview = async () => {
    await fetchNextPage()
  }

  const handleScreenClose = () =>
    navigation.addListener('beforeRemove', () => {
      queryClient.removeQueries({
        queryKey: query.queryKey,
        exact: true,
      })
    })

  useEffect(handleScreenClose, [navigation, query.queryKey, queryClient])

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
