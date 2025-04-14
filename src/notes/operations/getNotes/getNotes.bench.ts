import { random } from 'lodash'
import { measureAsyncFunction } from 'reassure'
import { collection } from '@/collections/schema'
import { mockDatabase } from 'test/utils'

describe('getNotes', () => {
  test.each([
    {
      name: 'when searching for a note that does not exist and there are 0 notes',
      variable: {
        notes: 0,
        search: {
          exists: false,
        },
      },
    },
    {
      name: 'when searching for a note that does not exist and there is 1 note',
      variable: {
        notes: 1,
        search: {
          exists: false,
        },
      },
    },
    {
      name: 'when searching for a note that does not exist and there are 10 notes',
      variable: {
        notes: 10,
        search: {
          exists: false,
        },
      },
    },
    {
      name: 'when searching for a note that does not exist and there are 100 notes',
      variable: {
        notes: 100,
        search: {
          exists: false,
        },
      },
    },
    {
      name: 'when searching for a note that does not exist and there are 1000 notes',
      variable: {
        notes: 1000,
        search: { exists: false },
      },
    },
    {
      name: 'when searching for a note that exists and there is 1 note',

      variable: {
        notes: 1,
        search: {
          exists: true,
        },
      },
    },
    {
      name: 'when searching for a note that exists and there are 10 notes',
      variable: {
        notes: 10,
        search: {
          exists: true,
        },
      },
    },
    {
      name: 'when searching for a note that exists and there are 100 notes',
      variable: {
        notes: 100,
        search: {
          exists: true,
        },
      },
    },
    {
      name: 'when searching for a note that exists and there are 1000 notes',
      variable: {
        notes: 1000,
        search: {
          exists: true,
        },
      },
    },
    {
      name: 'when searching for multiple notes that exist and there are 10 notes',
      variable: {
        notes: 10,
        search: {
          exists: true,
          count: 10,
        },
      },
    },
    {
      name: 'when searching for multiple notes that exist and there are 100 notes',
      variable: {
        notes: 100,
        search: {
          exists: true,
          count: 20,
        },
      },
    },
    {
      name: 'when searching for multiple notes that exist and there are 1000 notes',
      variable: {
        notes: 1000,
        search: {
          exists: true,
          count: 20,
        },
      },
    },
  ])(
    '$name',
    async ({ variable }) => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const { createNote } = await import('../createNote')
      const { default: getNotes } = await import('./getNotes')
      let input = { filter: { id: [0] } } satisfies Parameters<
        typeof getNotes
      >[0]
      const data: Awaited<ReturnType<typeof createNote>>[] = []

      if (variable.notes) {
        const [{ id: collectionId }] = await database
          .insert(collection)
          .values({ name: 'Collection Name' })
          .returning()

        for (let index = 0; index < variable.notes; index++) {
          data.push(
            await createNote({
              collections: [collectionId],
              fields: [
                [{ value: `Front ${index}` }],
                [{ value: `Back ${index}` }],
              ],
              config: {
                reversible: true,
                separable: true,
              },
            }),
          )
        }
      }

      await measureAsyncFunction(async () => {
        input.filter.id = Array.from(
          { length: variable.search.count ?? 1 },
          () => (variable.search.exists ? data[random(data.length - 1)].id : 0),
        )

        await getNotes(input)
      })

      resetDatabaseMock()
    },
    60000,
  )
})
