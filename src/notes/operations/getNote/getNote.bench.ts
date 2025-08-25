import { measureAsyncFunction } from 'reassure'
import { collection } from '@/collections/schema'
import { mockDatabase } from 'test/utils'

describe('getNote', () => {
  test.each([
    {
      name: 'when searching for a note that does not exist and there are 0 notes',
      fixture: {
        notes: 0,
      },
      variable: {
        noteExists: false,
      },
    },
    {
      name: 'when searching for a note that does not exist and there is 1 note',
      fixture: {
        notes: 1,
      },
      variable: {
        noteExists: false,
      },
    },
    {
      name: 'when searching for a note that does not exist and there are 10 notes',
      fixture: {
        notes: 10,
      },
      variable: {
        noteExists: false,
      },
    },
    {
      name: 'when searching for a note that does not exist and there are 100 notes',
      fixture: {
        notes: 100,
      },
      variable: {
        noteExists: false,
      },
    },
    {
      name: 'when searching for a note that does not exist and there are 1000 notes',
      fixture: {
        notes: 1000,
      },
      variable: {
        noteExists: false,
      },
    },
    {
      name: 'when searching for a note that exists and there is 1 note',
      fixture: {
        notes: 1,
      },
      variable: {
        noteExists: true,
      },
    },
    {
      name: 'when searching for a note that exists and there are 10 notes',
      fixture: {
        notes: 10,
      },
      variable: {
        noteExists: true,
      },
    },
    {
      name: 'when searching for a note that exists and there are 100 notes',
      fixture: {
        notes: 100,
      },
      variable: {
        noteExists: true,
      },
    },
    {
      name: 'when searching for a note that exists and there are 1000 notes',
      fixture: {
        notes: 1000,
      },
      variable: {
        noteExists: true,
      },
    },
  ])(
    '$name',
    async ({ fixture, variable }) => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const { createNote } = await import('../createNote')
      const { default: getNote } = await import('./getNote')
      let input = 0 satisfies Parameters<typeof getNote>[0]
      const data: Awaited<ReturnType<typeof createNote>>[] = []

      if (fixture.notes) {
        const [{ id: collectionId }] = await database
          .insert(collection)
          .values({ name: 'Collection Name' })
          .returning()

        for (let index = 0; index < fixture.notes; index++) {
          data.push(
            await createNote({
              collections: [collectionId],
              fields: [
                [{ type: 'text/plain', value: `Front ${index}` }],
                [{ type: 'text/plain', value: `Back ${index}` }],
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
        input = variable.noteExists
          ? data?.[Math.floor(Math.random() * data.length)].id
          : 0

        await getNote(input)
      })

      resetDatabaseMock()
    },
    60000,
  )
})
