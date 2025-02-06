import { database } from '@/data/database'

export default async function getCollections() {
  return await database.query.collection.findMany()
}
