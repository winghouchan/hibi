import { database } from '@/data'

export default async function getOnboardingCollection() {
  return (
    (await database.query.collection.findFirst({ with: { notes: true } })) ||
    null
  )
}
