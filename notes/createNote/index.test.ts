import { collection } from '@/collections/schema'
import { mockDatabase } from '@/test/utils'
import hashNoteFieldValue from '../hashNoteFieldValue'
import createNote from '.'

describe('createNote', () => {
  test.each([
    {
      name: 'when an empty list of collection IDs is provided, throws an error and does not alter the database state',
      input: {
        collections: [],
        fields: [[{ value: 'Front 1' }], [{ value: 'Back 1' }]],
        config: { reversible: false, separable: false },
      },
      expected: {
        databaseState: [],
        output: expect.objectContaining({
          message: expect.stringContaining('at least 1 collection is required'),
        }),
      },
    },
    {
      name: 'when the collection ID references a non-existent collection, throws an error and does not alter the database state',
      input: {
        collections: [-1],
        fields: [[{ value: 'Front 1' }], [{ value: 'Back 1' }]],
        config: { reversible: false, separable: false },
      },
      expected: {
        databaseState: [],
        output: expect.objectContaining({
          message: expect.stringContaining('FOREIGN KEY constraint failed'),
        }),
      },
    },
    {
      name: 'when an empty list of fields is provided, throws an error and does not alter the database state',
      input: {
        collections: [1],
        fields: [],
        config: { reversible: false, separable: false },
      },
      expected: {
        databaseState: [],
        output: expect.objectContaining({
          message: expect.stringContaining('2 sides are required'),
        }),
      },
    },
    {
      name: 'when less than two sides are provided, throws an error and does not alter the database state',
      input: {
        collections: [1],
        fields: [[{ value: 'Front 1' }]],
        config: { reversible: false, separable: false },
      },
      expected: {
        databaseState: [],
        output: expect.objectContaining({
          message: expect.stringContaining('2 sides are required'),
        }),
      },
    },
    {
      name: 'when all sides have no fields, throws an error and does not alter the database state',
      input: {
        collections: [1],
        fields: [[], []],
        config: { reversible: false, separable: false },
      },
      expected: {
        databaseState: [],
        output: expect.objectContaining({
          message: expect.stringContaining(
            'every side requires at least 1 field',
          ),
        }),
      },
    },
    {
      name: 'when a side has no fields, throws an error and does not alter the database state',
      input: {
        collections: [1],
        fields: [[{ value: 'Front 1' }], []],
        config: { reversible: false, separable: false },
      },
      expected: {
        databaseState: [],
        output: expect.objectContaining({
          message: expect.stringContaining(
            'every side requires at least 1 field',
          ),
        }),
      },
    },

    {
      name: 'when a field value is an empty string, throws an error and does not alter the database state',
      input: {
        collections: [1],
        fields: [[{ value: '' }], [{ value: 'Back 1' }]],
        config: { reversible: false, separable: false },
      },
      expected: {
        databaseState: [],
        output: expect.objectContaining({
          message: expect.stringContaining(
            'CHECK constraint failed: length(`value`) > 0',
          ),
        }),
      },
    },
  ])('$name', async ({ input, expected }) => {
    const { database, resetDatabaseMock } = await mockDatabase()

    const output = await createNote(input).catch((error) => error)
    const databaseState = await database.query.note.findMany({
      with: {
        collections: true,
        fields: true,
        reviewables: true,
      },
    })

    expect(output).toEqual(expected.output)
    expect(databaseState).toEqual(expected.databaseState)

    resetDatabaseMock()
  })

  describe.each([
    { reversible: false, separable: false },
    { reversible: true, separable: false },
    { reversible: false, separable: true },
    { reversible: true, separable: true },
  ])('when reversible: $reversible, separable: $separable', (config) => {
    test.each([
      {
        name: 'and there is 1 field on each side with unique values, the correct state is produced and returned',
        input: {
          fields: [[{ value: 'Front 1' }], [{ value: 'Back 1' }]],
          config,
        },
        expected: {
          id: 1,
          is_reversible: config.reversible,
          is_separable: config.separable,
          created_at: expect.any(Date),
          collections: [
            {
              id: 1,
              name: 'Collection Name',
              created_at: expect.any(Date),
            },
          ],
          fields: [
            {
              id: 1,
              note: 1,
              value: 'Front 1',
              hash: hashNoteFieldValue('Front 1'),
              side: 0,
              position: 0,
              is_archived: false,
              created_at: expect.any(Date),
            },
            {
              id: 2,
              note: 1,
              value: 'Back 1',
              hash: hashNoteFieldValue('Back 1'),
              side: 1,
              position: 0,
              is_archived: false,
              created_at: expect.any(Date),
            },
          ],
          reviewables: [
            {
              id: 1,
              note: 1,
              is_archived: false,
              created_at: expect.any(Date),
              fields: [
                {
                  id: 1,
                  reviewable: 1,
                  field: 1,
                  side: 0,
                  created_at: expect.any(Date),
                },
                {
                  id: 2,
                  reviewable: 1,
                  field: 2,
                  side: 1,
                  created_at: expect.any(Date),
                },
              ],
              reviews: [],
            },
            /* eslint-disable jest/no-conditional-expect */
            ...(config.reversible
              ? [
                  {
                    id: 2,
                    note: 1,
                    is_archived: false,
                    created_at: expect.any(Date),
                    fields: [
                      {
                        id: 3,
                        reviewable: 2,
                        field: 2,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 4,
                        reviewable: 2,
                        field: 1,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                    ],
                    reviews: [],
                  },
                ]
              : []),
            /* eslint-enable jest/no-conditional-expect */
          ],
        },
      },
      {
        name: 'and there is 1 field on each side with non-unique values, the correct state is produced and returned',
        input: {
          fields: [[{ value: 'Field value' }], [{ value: 'Field value' }]],
          config,
        },
        expected: {
          id: 1,
          is_reversible: config.reversible,
          is_separable: config.separable,
          created_at: expect.any(Date),
          collections: [
            {
              id: 1,
              name: 'Collection Name',
              created_at: expect.any(Date),
            },
          ],
          fields: [
            {
              id: 1,
              note: 1,
              value: 'Field value',
              hash: hashNoteFieldValue('Field value'),
              side: 0,
              position: 0,
              is_archived: false,
              created_at: expect.any(Date),
            },
            {
              id: 2,
              note: 1,
              value: 'Field value',
              hash: hashNoteFieldValue('Field value'),
              side: 1,
              position: 0,
              is_archived: false,
              created_at: expect.any(Date),
            },
          ],
          reviewables: [
            {
              id: 1,
              note: 1,
              is_archived: false,
              created_at: expect.any(Date),
              fields: [
                {
                  id: 1,
                  reviewable: 1,
                  field: 1,
                  side: 0,
                  created_at: expect.any(Date),
                },
                {
                  id: 2,
                  reviewable: 1,
                  field: 2,
                  side: 1,
                  created_at: expect.any(Date),
                },
              ],
              reviews: [],
            },
            /* eslint-disable jest/no-conditional-expect */
            ...(config.reversible
              ? [
                  {
                    id: 2,
                    note: 1,
                    is_archived: false,
                    created_at: expect.any(Date),
                    fields: [
                      {
                        id: 3,
                        reviewable: 2,
                        field: 2,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 4,
                        reviewable: 2,
                        field: 1,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                    ],
                    reviews: [],
                  },
                ]
              : []),
            /* eslint-enable jest/no-conditional-expect */
          ],
        },
      },
      {
        name: 'and there is more than 1 field on each side with unique values, the correct state is produced and returned',
        input: {
          fields: [
            [{ value: 'Front 1' }, { value: 'Front 2' }],
            [{ value: 'Back 1' }, { value: 'Back 2' }],
          ],
          config,
        },
        expected: {
          id: 1,
          is_reversible: config.reversible,
          is_separable: config.separable,
          created_at: expect.any(Date),
          collections: [
            {
              id: 1,
              name: 'Collection Name',
              created_at: expect.any(Date),
            },
          ],
          fields: [
            {
              id: 1,
              note: 1,
              value: 'Front 1',
              hash: hashNoteFieldValue('Front 1'),
              side: 0,
              position: 0,
              is_archived: false,
              created_at: expect.any(Date),
            },
            {
              id: 2,
              note: 1,
              value: 'Front 2',
              hash: hashNoteFieldValue('Front 2'),
              side: 0,
              position: 1,
              is_archived: false,
              created_at: expect.any(Date),
            },
            {
              id: 3,
              note: 1,
              value: 'Back 1',
              hash: hashNoteFieldValue('Back 1'),
              side: 1,
              position: 0,
              is_archived: false,
              created_at: expect.any(Date),
            },
            {
              id: 4,
              note: 1,
              value: 'Back 2',
              hash: hashNoteFieldValue('Back 2'),
              side: 1,
              position: 1,
              is_archived: false,
              created_at: expect.any(Date),
            },
          ],
          reviewables: [
            /* eslint-disable jest/no-conditional-expect */
            ...(!config.separable
              ? [
                  {
                    id: 1,
                    note: 1,
                    is_archived: false,
                    created_at: expect.any(Date),
                    fields: [
                      {
                        id: 1,
                        reviewable: 1,
                        field: 1,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 2,
                        reviewable: 1,
                        field: 2,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 3,
                        reviewable: 1,
                        field: 3,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 4,
                        reviewable: 1,
                        field: 4,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                    ],
                    reviews: [],
                  },
                ]
              : []),
            ...(config.reversible && !config.separable
              ? [
                  {
                    id: 2,
                    note: 1,
                    is_archived: false,
                    created_at: expect.any(Date),
                    fields: [
                      {
                        id: 5,
                        reviewable: 2,
                        field: 3,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 6,
                        reviewable: 2,
                        field: 4,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 7,
                        reviewable: 2,
                        field: 1,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 8,
                        reviewable: 2,
                        field: 2,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                    ],
                    reviews: [],
                  },
                ]
              : []),
            ...(!config.reversible && config.separable
              ? [
                  {
                    id: 1,
                    note: 1,
                    is_archived: false,
                    created_at: expect.any(Date),
                    fields: [
                      {
                        id: 1,
                        reviewable: 1,
                        field: 1,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 2,
                        reviewable: 1,
                        field: 2,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 3,
                        reviewable: 1,
                        field: 3,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                    ],
                    reviews: [],
                  },
                  {
                    id: 2,
                    note: 1,
                    is_archived: false,
                    created_at: expect.any(Date),
                    fields: [
                      {
                        id: 4,
                        reviewable: 2,
                        field: 1,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 5,
                        reviewable: 2,
                        field: 2,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 6,
                        reviewable: 2,
                        field: 4,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                    ],
                    reviews: [],
                  },
                ]
              : []),
            ...(config.reversible && config.separable
              ? [
                  {
                    id: 1,
                    note: 1,
                    is_archived: false,
                    created_at: expect.any(Date),
                    fields: [
                      {
                        id: 1,
                        reviewable: 1,
                        field: 1,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 2,
                        reviewable: 1,
                        field: 2,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 3,
                        reviewable: 1,
                        field: 3,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                    ],
                    reviews: [],
                  },
                  {
                    id: 2,
                    note: 1,
                    is_archived: false,
                    created_at: expect.any(Date),
                    fields: [
                      {
                        id: 4,
                        reviewable: 2,
                        field: 3,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 5,
                        reviewable: 2,
                        field: 1,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 6,
                        reviewable: 2,
                        field: 2,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                    ],
                    reviews: [],
                  },
                  {
                    id: 3,
                    note: 1,
                    is_archived: false,
                    created_at: expect.any(Date),
                    fields: [
                      {
                        id: 7,
                        reviewable: 3,
                        field: 3,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 8,
                        reviewable: 3,
                        field: 4,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                    ],
                    reviews: [],
                  },
                  {
                    id: 4,
                    note: 1,
                    is_archived: false,
                    created_at: expect.any(Date),
                    fields: [
                      {
                        id: 9,
                        reviewable: 4,
                        field: 1,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 10,
                        reviewable: 4,
                        field: 2,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 11,
                        reviewable: 4,
                        field: 4,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                    ],
                    reviews: [],
                  },
                  {
                    id: 5,
                    note: 1,
                    is_archived: false,
                    created_at: expect.any(Date),
                    fields: [
                      {
                        id: 12,
                        reviewable: 5,
                        field: 4,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 13,
                        reviewable: 5,
                        field: 1,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 14,
                        reviewable: 5,
                        field: 2,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                    ],
                    reviews: [],
                  },
                  {
                    id: 6,
                    note: 1,
                    is_archived: false,
                    created_at: expect.any(Date),
                    fields: [
                      {
                        id: 15,
                        reviewable: 6,
                        field: 4,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 16,
                        reviewable: 6,
                        field: 3,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                    ],
                    reviews: [],
                  },
                ]
              : []),
            /* eslint-enable jest/no-conditional-expect */
          ],
        },
      },
      {
        name: 'and there is more than 1 field on each side with non-unique values, the correct state is produced and returned',
        input: {
          fields: [
            [{ value: 'Field value' }, { value: 'Field value' }],
            [{ value: 'Field value' }, { value: 'Field value' }],
          ],
          config,
        },
        expected: {
          id: 1,
          is_reversible: config.reversible,
          is_separable: config.separable,
          created_at: expect.any(Date),
          collections: [
            {
              id: 1,
              name: 'Collection Name',
              created_at: expect.any(Date),
            },
          ],
          fields: [
            {
              id: 1,
              note: 1,
              value: 'Field value',
              hash: hashNoteFieldValue('Field value'),
              side: 0,
              position: 0,
              is_archived: false,
              created_at: expect.any(Date),
            },
            {
              id: 2,
              note: 1,
              value: 'Field value',
              hash: hashNoteFieldValue('Field value'),
              side: 0,
              position: 1,
              is_archived: false,
              created_at: expect.any(Date),
            },
            {
              id: 3,
              note: 1,
              value: 'Field value',
              hash: hashNoteFieldValue('Field value'),
              side: 1,
              position: 0,
              is_archived: false,
              created_at: expect.any(Date),
            },
            {
              id: 4,
              note: 1,
              value: 'Field value',
              hash: hashNoteFieldValue('Field value'),
              side: 1,
              position: 1,
              is_archived: false,
              created_at: expect.any(Date),
            },
          ],
          reviewables: [
            /* eslint-disable jest/no-conditional-expect */
            ...(!config.separable
              ? [
                  {
                    id: 1,
                    note: 1,
                    is_archived: false,
                    created_at: expect.any(Date),
                    fields: [
                      {
                        id: 1,
                        reviewable: 1,
                        field: 1,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 2,
                        reviewable: 1,
                        field: 2,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 3,
                        reviewable: 1,
                        field: 3,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 4,
                        reviewable: 1,
                        field: 4,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                    ],
                    reviews: [],
                  },
                ]
              : []),
            ...(config.reversible && !config.separable
              ? [
                  {
                    id: 2,
                    note: 1,
                    is_archived: false,
                    created_at: expect.any(Date),
                    fields: [
                      {
                        id: 5,
                        reviewable: 2,
                        field: 3,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 6,
                        reviewable: 2,
                        field: 4,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 7,
                        reviewable: 2,
                        field: 1,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 8,
                        reviewable: 2,
                        field: 2,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                    ],
                    reviews: [],
                  },
                ]
              : []),
            ...(!config.reversible && config.separable
              ? [
                  {
                    id: 1,
                    note: 1,
                    is_archived: false,
                    created_at: expect.any(Date),
                    fields: [
                      {
                        id: 1,
                        reviewable: 1,
                        field: 1,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 2,
                        reviewable: 1,
                        field: 2,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 3,
                        reviewable: 1,
                        field: 3,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                    ],
                    reviews: [],
                  },
                  {
                    id: 2,
                    note: 1,
                    is_archived: false,
                    created_at: expect.any(Date),
                    fields: [
                      {
                        id: 4,
                        reviewable: 2,
                        field: 1,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 5,
                        reviewable: 2,
                        field: 2,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 6,
                        reviewable: 2,
                        field: 4,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                    ],
                    reviews: [],
                  },
                ]
              : []),
            ...(config.reversible && config.separable
              ? [
                  {
                    id: 1,
                    note: 1,
                    is_archived: false,
                    created_at: expect.any(Date),
                    fields: [
                      {
                        id: 1,
                        reviewable: 1,
                        field: 1,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 2,
                        reviewable: 1,
                        field: 2,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 3,
                        reviewable: 1,
                        field: 3,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                    ],
                    reviews: [],
                  },
                  {
                    id: 2,
                    note: 1,
                    is_archived: false,
                    created_at: expect.any(Date),
                    fields: [
                      {
                        id: 4,
                        reviewable: 2,
                        field: 3,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 5,
                        reviewable: 2,
                        field: 1,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 6,
                        reviewable: 2,
                        field: 2,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                    ],
                    reviews: [],
                  },
                  {
                    id: 3,
                    note: 1,
                    is_archived: false,
                    created_at: expect.any(Date),
                    fields: [
                      {
                        id: 7,
                        reviewable: 3,
                        field: 3,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 8,
                        reviewable: 3,
                        field: 4,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                    ],
                    reviews: [],
                  },
                  {
                    id: 4,
                    note: 1,
                    is_archived: false,
                    created_at: expect.any(Date),
                    fields: [
                      {
                        id: 9,
                        reviewable: 4,
                        field: 1,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 10,
                        reviewable: 4,
                        field: 2,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 11,
                        reviewable: 4,
                        field: 4,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                    ],
                    reviews: [],
                  },
                  {
                    id: 5,
                    note: 1,
                    is_archived: false,
                    created_at: expect.any(Date),
                    fields: [
                      {
                        id: 12,
                        reviewable: 5,
                        field: 4,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 13,
                        reviewable: 5,
                        field: 1,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 14,
                        reviewable: 5,
                        field: 2,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                    ],
                    reviews: [],
                  },
                  {
                    id: 6,
                    note: 1,
                    is_archived: false,
                    created_at: expect.any(Date),
                    fields: [
                      {
                        id: 15,
                        reviewable: 6,
                        field: 4,
                        side: 0,
                        created_at: expect.any(Date),
                      },
                      {
                        id: 16,
                        reviewable: 6,
                        field: 3,
                        side: 1,
                        created_at: expect.any(Date),
                      },
                    ],
                    reviews: [],
                  },
                ]
              : []),
            /* eslint-enable jest/no-conditional-expect */
          ],
        },
      },
    ])('$name', async ({ input, expected }) => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const [{ collectionId }] = await database
        .insert(collection)
        .values({ name: 'Collection Name' })
        .returning({ collectionId: collection.id })

      const output = await createNote({
        collections: [collectionId],
        ...input,
      }).catch((error) => error)
      const databaseState = (
        await database.query.note.findMany({
          with: {
            collections: {
              with: {
                collection: true,
              },
            },
            fields: true,
            reviewables: {
              with: {
                fields: true,
                reviews: true,
              },
            },
          },
        })
      ).map((note) => ({
        ...note,
        collections: note.collections.map(({ collection }) => collection),
      }))

      expect(output).toEqual(expected)
      expect(databaseState).toEqual([expected])

      resetDatabaseMock()
    })
  })
})
