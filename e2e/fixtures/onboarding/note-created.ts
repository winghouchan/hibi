import { createCollection } from '@/collections/operations/createCollection'
import { createNote } from '@/notes/operations/createNote'

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

export default fixture
