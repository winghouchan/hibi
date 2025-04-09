import { measureAsyncFunction } from 'reassure'
import { mockDatabase } from 'test/utils'

describe('createCollection', () => {
  test.each([
    {
      name: 'when creating a collection',
      input: {
        name: 'Collection Name',
      },
    },
  ])('$name', async ({ input }) => {
    const { resetDatabaseMock } = await mockDatabase()
    const { default: createCollection } = await import('./createCollection')

    await measureAsyncFunction(async () => await createCollection(input))

    resetDatabaseMock()
  })
})
