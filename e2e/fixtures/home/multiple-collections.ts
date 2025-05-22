import { createCollection } from '@/collections/operations/createCollection'
import { database } from '@/data/database'
import { createNote } from '@/notes/operations/createNote'
import { user } from '@/user/schema'

async function fixture() {
  const { id: collection1 } = await createCollection({
    name: 'Test Collection 1',
  })

  await createNote({
    collections: [collection1],
    fields: [[{ value: 'Front 1' }], [{ value: 'Back 1' }]],
    config: {
      reversible: false,
      separable: false,
    },
  })

  const { id: collection2 } = await createCollection({
    name: 'Test Collection 2',
  })

  await createNote({
    collections: [collection2],
    fields: [[{ value: 'Front 1' }], [{ value: 'Back 1' }]],
    config: {
      reversible: false,
      separable: false,
    },
  })

  await database.insert(user).values({ onboarded: true })
}

export default fixture
