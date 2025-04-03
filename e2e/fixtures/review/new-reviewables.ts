import { createCollection } from '@/collections/operations/createCollection'
import { database } from '@/data/database'
import { createNote } from '@/notes/operations/createNote'
import { user } from '@/user/schema'

async function fixture() {
  const { id } = await createCollection({
    name: 'Collection Name',
  })

  await createNote({
    collections: [id],
    fields: [[{ value: 'Front 1' }], [{ value: 'Back 1' }]],
    config: {
      reversible: true,
      separable: true,
    },
  })

  await database.insert(user).values({ onboarded: true })
}

export default fixture
