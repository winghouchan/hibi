import { database, tracer } from '@/data/database'

async function getOnboardingCollection() {
  const collection = await database.query.collection.findFirst()

  return collection ?? null
}

export default tracer.withSpan(
  { name: 'getOnboardingCollection' },
  getOnboardingCollection,
)
