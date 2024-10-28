import { database } from '@/data'

export default async function getOnboardingCollection() {
  const collection = await database.query.collection.findFirst({
    with: {
      notes: {
        with: {
          note: {
            with: {
              fields: true,
            },
          },
        },
      },
    },
  })

  return collection
    ? {
        ...collection,
        notes: collection.notes.map<
          Omit<(typeof collection.notes)[number]['note'], keyof number>
        >(({ note }) => note),
      }
    : null
}
