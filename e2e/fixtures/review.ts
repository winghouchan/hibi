import { createCollection } from '@/collections'
import { database } from '@/data'
import { createNote } from '@/notes'
import { user } from '@/user/schema'

async function fixture() {
  const { id } = await createCollection({
    name: 'Collection Name',
  })

  await createNote({
    collections: [id],
    fields: [[{ value: 'Front 1' }], [{ value: 'Back 1' }]],
    config: {
      reversible: false,
      separable: false,
    },
  })

  await database.insert(user).values({ onboarded: true })
}

fixture()
