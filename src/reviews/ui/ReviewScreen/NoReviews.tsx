import { Trans, useLingui } from '@lingui/react/macro'
import { Link } from 'expo-router'
import { Button } from '@/ui'
import Layout from '../Layout'

export default function NoReviews() {
  const { t: translate } = useLingui()

  return (
    <>
      <Layout.Main testID="review.no-reviews">
        <Trans>No reviews due</Trans>
      </Layout.Main>
      <Layout.Footer>
        <Link href="/" testID="review.no-reviews.cta" dismissTo asChild>
          <Button>{translate`Go home`}</Button>
        </Link>
      </Layout.Footer>
    </>
  )
}
