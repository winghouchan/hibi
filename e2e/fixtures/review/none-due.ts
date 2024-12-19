import { Rating } from 'ts-fsrs'
import { createCollection } from '@/collections'
import { database } from '@/data'
import { createNote } from '@/notes'
import { createReview } from '@/reviews'
import { user } from '@/user/schema'

async function fixture() {
  const { id: collectionId } = await createCollection({
    name: 'Collection Name',
  })

  const { reviewables } = await createNote({
    collections: [collectionId],
    fields: [[{ value: 'Front 1' }], [{ value: 'Back 1' }]],
    config: {
      reversible: false,
      separable: false,
    },
  })

  await Promise.all(
    reviewables.map(({ id: reviewable }) =>
      createReview({ reviewable, rating: Rating.Easy, duration: 1000 }),
    ),
  )

  await database.insert(user).values({ onboarded: true })
}

export default fixture
