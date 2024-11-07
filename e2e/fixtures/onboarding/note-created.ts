import { createCollection } from '@/collections'
import { createNote } from '@/notes'

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
}

fixture()
