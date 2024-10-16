import { mockDatabase } from 'test/utils'

describe('isOnboardingComplete', () => {
  test.each([
    {
      name: 'when there are 0 collections, returns `false`',
      fixture: {},
      expected: false,
    },
    {
      name: 'when there is 1 collection with 0 notes, returns `false`',
      fixture: {
        collections: [
          {
            name: 'Collection 1',
            notes: [],
          },
        ],
      },
      expected: false,
    },
    {
      name: 'when there is 1 collection with 1 note, returns `true`',
      fixture: {
        collections: [
          {
            name: 'Collection 1',
            notes: [[[{ value: 'Front 1' }], [{ value: 'Back 1' }]]],
          },
        ],
      },
      expected: true,
    },
    {
      name: 'when there is 1 collection with more than 1 note, returns `true`',
      fixture: {
        collections: [
          {
            name: 'Collection 1',
            notes: [
              [[{ value: 'Front 1' }], [{ value: 'Back 1' }]],
              [[{ value: 'Front 1' }], [{ value: 'Back 1' }]],
            ],
          },
        ],
      },
      expected: true,
    },
    {
      name: 'when there is more 1 collections each with 0 notes, returns `false`',
      fixture: {
        collections: [
          { name: 'Collection 1', notes: [] },
          { name: 'Collection 2', notes: [] },
        ],
      },
      expected: false,
    },
    {
      name: 'when there is more than 1 collection with 1 collection have more than 1 note, returns `true`',
      fixture: {
        collections: [
          {
            name: 'Collection 1',
            notes: [
              [[{ value: 'Front 1' }], [{ value: 'Back 1' }]],
              [[{ value: 'Front 1' }], [{ value: 'Back 1' }]],
            ],
          },
          {
            name: 'Collection 2',
            notes: [],
          },
        ],
      },
      expected: true,
    },
  ])('$name', async ({ fixture, expected }) => {
    const { resetDatabaseMock } = await mockDatabase()
    const { createCollection } = await import('@/collections')
    const { createNote } = await import('@/notes')
    const { default: isOnboardingComplete } = await import(
      './isOnboardingComplete'
    )

    await Promise.all(
      fixture.collections?.map(async ({ name, notes }) => {
        const { id } = await createCollection({ name })

        await Promise.all(
          notes?.map(
            async (fields) =>
              await createNote({
                collections: [id],
                fields,
                config: { reversible: false, separable: false },
              }),
          ) ?? [],
        )
      }) ?? [],
    )

    const output = await isOnboardingComplete()

    expect(output).toEqual(expected)

    resetDatabaseMock()
  })
})
