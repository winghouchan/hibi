import { Trans, useLingui } from '@lingui/react/macro'
import { useRouter } from 'expo-router'
import { Button } from '@/ui'
import Layout from '../Layout'

export default function ReviewFinished() {
  const { t: translate } = useLingui()
  const router = useRouter()

  return (
    <>
      <Layout.Main testID="review.finished.screen">
        <Trans>Finished</Trans>
      </Layout.Main>
      <Layout.Footer>
        <Button testID="review.finish" onPress={() => router.back()}>
          {translate`Finish`}
        </Button>
      </Layout.Footer>
    </>
  )
}
