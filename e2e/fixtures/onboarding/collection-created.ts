import { createCollection } from '@/collections'

async function fixture() {
  await createCollection({
    name: 'Collection Name',
  })
}

fixture()
