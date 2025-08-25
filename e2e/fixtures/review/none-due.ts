import { Rating } from 'ts-fsrs'
import { createCollection } from '@/collections/operations/createCollection'
import { database } from '@/data/database'
import { createNote } from '@/notes/operations/createNote'
import { createReview } from '@/reviews/operations/createReview'
import { user } from '@/user/schema'

async function fixture() {
  const { id: collectionId } = await createCollection({
    name: 'Collection Name',
  })

  const { reviewables } = await createNote({
    collections: [collectionId],
    fields: [
      [{ type: 'text/plain', value: 'Front 1' }],
      [{ type: 'text/plain', value: 'Back 1' }],
    ],
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
