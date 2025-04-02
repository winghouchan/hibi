import { useSuspenseInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { useEffect, useRef } from 'react'
import PagerView from 'react-native-pager-view'
import { nextReviewsQuery } from '../../operations'
import Layout from '../Layout'
import NoReviews from './NoReviews'
import Review from './Review'
import ReviewFinished from './ReviewFinished'

/**
 * Maximum number of reviews that can be completed in one set of reviews
 *
 * @todo Make this configurable by the user
 */
const MAX_REVIEW_COUNT = 20

export default function ReviewScreen() {
  const localSearchParams = useLocalSearchParams<{ collections?: string }>()
  const collections = localSearchParams.collections?.split(',').map(Number)
  const initialPage = 0
  const navigation = useNavigation()
  const queryClient = useQueryClient()
  const pagerViewRef = useRef<PagerView>(null)
  const query = nextReviewsQuery({ filter: { collections, due: true } })
  const { data, error, fetchNextPage, isFetching } =
    useSuspenseInfiniteQuery(query)

  if (error && !isFetching) {
    throw error
  }

  const onNewPage = () => {
    // Set the current page of the pager view to the last page after it has rendered
    setTimeout(() => {
      data.length && pagerViewRef.current?.setPage(data.length - 1)
    }, 0)
  }

  const onReview = async () => {
    await fetchNextPage()
  }

  const handleScreenClose = () =>
    navigation.addListener('beforeRemove', () => {
      queryClient.invalidateQueries({
        queryKey: query.queryKey,
        exact: true,
      })
    })

  useEffect(handleScreenClose, [navigation, query.queryKey, queryClient])

  useEffect(onNewPage, [data.length])

  return (
    <Layout testID="review.screen">
      {data[0] !== null ? (
        <PagerView
          initialPage={initialPage}
          ref={pagerViewRef}
          scrollEnabled={false}
          style={{ flex: 1 }}
        >
          {data.map((reviewable, index) => {
            const finishedReview =
              (reviewable === null && index > 0) || index === MAX_REVIEW_COUNT

            if (finishedReview) {
              return <ReviewFinished key={index} />
            }

            if (reviewable) {
              return <Review key={index} {...reviewable} onReview={onReview} />
            }
          })}
        </PagerView>
      ) : (
        <NoReviews />
      )}
    </Layout>
  )
}
