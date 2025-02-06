import { createCollection } from '@/collections/operations'

async function fixture() {
  await createCollection({
    name: 'Collection Name',
  })
}

export default fixture
