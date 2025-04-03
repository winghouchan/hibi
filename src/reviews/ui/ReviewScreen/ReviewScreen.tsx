import { useSuspenseInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import PagerView from 'react-native-pager-view'
import { nextReviewsQuery } from '../../operations'
import Layout from '../Layout'
import NoReviews from './NoReviews'
import Review from './Review'
import ReviewFinished from './ReviewFinished'

export default function ReviewScreen() {
  const localSearchParams = useLocalSearchParams<{ collections?: string }>()
  const collections = localSearchParams.collections?.split(',').map(Number)
  const navigation = useNavigation()
  const queryClient = useQueryClient()
  const pagerViewRef = useRef<PagerView>(null)
  const initialPage = 0
  const [page, setPage] = useState(initialPage)
  const query = nextReviewsQuery({ filter: { collections, due: true } })
  const { data } = useSuspenseInfiniteQuery(query)
  const pages = [...data, null]

  const handlePageChange = () => {
    pagerViewRef.current?.setPage(page)
  }

  const handleReview = () => {
    setPage((page) => page + 1)
  }

  const handleScreenClose = () =>
    navigation.addListener('beforeRemove', () => {
      queryClient.invalidateQueries({
        queryKey: query.queryKey,
        exact: true,
      })
    })

  useEffect(handlePageChange, [page])
  useEffect(handleScreenClose, [navigation, query.queryKey, queryClient])

  return (
    <Layout testID="review.screen">
      {pages[0] !== null ? (
        <PagerView
          initialPage={initialPage}
          ref={pagerViewRef}
          scrollEnabled={false}
          style={{ flex: 1 }}
        >
          {pages.map((reviewable, index) =>
            reviewable ? (
              <Review
                active={index === page}
                key={index}
                {...reviewable}
                onReview={handleReview}
              />
            ) : (
              <ReviewFinished key={index} />
            ),
          )}
        </PagerView>
      ) : (
        <NoReviews />
      )}
    </Layout>
  )
}
