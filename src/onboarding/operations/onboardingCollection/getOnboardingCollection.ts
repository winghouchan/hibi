import { database } from '@/data/database'

export default async function getOnboardingCollection() {
  const collection = await database.query.collection.findFirst()

  return collection ?? null
}
