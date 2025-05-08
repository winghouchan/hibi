import { collection, collectionToNote } from '@/collections/schema'
import hashNoteFieldValue from '@/notes/hashNoteFieldValue'
import { mockDatabase } from 'test/utils'
import { note, noteField } from '../../schema'

describe('getNotes', () => {
  test.each([
    {
      name: 'when given no filters and no notes exist, returns an empty array',
      fixture: {},
      input: undefined,
      expected: {
        cursor: {
          next: undefined,
        },
        notes: [],
      },
    },
    {
      name: 'when given no filters and some notes exist, returns all notes up to the default pagination limit',
      fixture: {
        collections: [{ id: 1, name: 'Collection Mock' }],
        notes: [
          {
            id: 1,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
          {
            id: 2,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
          {
            id: 3,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
          {
            id: 4,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
          {
            id: 5,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
          {
            id: 6,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
          {
            id: 7,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
          {
            id: 8,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
          {
            id: 9,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
          {
            id: 10,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
          {
            id: 11,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
        ],
      },
      input: undefined,
      expected: {
        cursor: {
          next: 11,
        },
        notes: [
          expect.objectContaining({
            id: 1,
            reversible: false,
            separable: false,
            createdAt: expect.any(Date),
            fields: [
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Front',
                }),
              ],
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Back',
                }),
              ],
            ],
          }),
          expect.objectContaining({
            id: 2,
            reversible: false,
            separable: false,
            createdAt: expect.any(Date),
            fields: [
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Front',
                }),
              ],
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Back',
                }),
              ],
            ],
          }),
          expect.objectContaining({
            id: 3,
            reversible: false,
            separable: false,
            createdAt: expect.any(Date),
            fields: [
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Front',
                }),
              ],
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Back',
                }),
              ],
            ],
          }),
          expect.objectContaining({
            id: 4,
            reversible: false,
            separable: false,
            createdAt: expect.any(Date),
            fields: [
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Front',
                }),
              ],
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Back',
                }),
              ],
            ],
          }),
          expect.objectContaining({
            id: 5,
            reversible: false,
            separable: false,
            createdAt: expect.any(Date),
            fields: [
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Front',
                }),
              ],
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Back',
                }),
              ],
            ],
          }),
          expect.objectContaining({
            id: 6,
            reversible: false,
            separable: false,
            createdAt: expect.any(Date),
            fields: [
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Front',
                }),
              ],
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Back',
                }),
              ],
            ],
          }),
          expect.objectContaining({
            id: 7,
            reversible: false,
            separable: false,
            createdAt: expect.any(Date),
            fields: [
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Front',
                }),
              ],
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Back',
                }),
              ],
            ],
          }),
          expect.objectContaining({
            id: 8,
            reversible: false,
            separable: false,
            createdAt: expect.any(Date),
            fields: [
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Front',
                }),
              ],
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Back',
                }),
              ],
            ],
          }),
          expect.objectContaining({
            id: 9,
            reversible: false,
            separable: false,
            createdAt: expect.any(Date),
            fields: [
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Front',
                }),
              ],
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Back',
                }),
              ],
            ],
          }),
          expect.objectContaining({
            id: 10,
            reversible: false,
            separable: false,
            createdAt: expect.any(Date),
            fields: [
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Front',
                }),
              ],
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Back',
                }),
              ],
            ],
          }),
        ],
      },
    },
    {
      name: 'when given a filter with an ID and a note with the given ID exists, returns the note',
      fixture: {
        collections: [{ id: 1, name: 'Collection Mock' }],
        notes: [
          {
            id: 1,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
        ],
      },
      input: {
        filter: {
          id: [1],
        },
      },
      expected: {
        cursor: {
          next: undefined,
        },
        notes: [
          expect.objectContaining({
            id: 1,
            reversible: false,
            separable: false,
            createdAt: expect.any(Date),
            fields: [
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Front',
                }),
              ],
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Back',
                }),
              ],
            ],
          }),
        ],
      },
    },
    {
      name: 'when given a filter with an ID and a note with the given ID does not exist, returns an empty array',
      fixture: {},
      input: {
        filter: {
          id: [1],
        },
      },
      expected: {
        cursor: {
          next: undefined,
        },
        notes: [],
      },
    },
    {
      name: 'when given filter with a list of IDs and notes with the given IDs exist, returns the notes',
      fixture: {
        collections: [{ id: 1, name: 'Collection Mock' }],
        notes: [
          {
            id: 1,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
          {
            id: 2,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
        ],
      },
      input: {
        filter: {
          id: [1, 2],
        },
      },
      expected: {
        cursor: {
          next: undefined,
        },
        notes: [
          expect.objectContaining({
            id: 1,
            reversible: false,
            separable: false,
            createdAt: expect.any(Date),
            fields: [
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Front',
                }),
              ],
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Back',
                }),
              ],
            ],
          }),
          expect.objectContaining({
            id: 2,
            reversible: false,
            separable: false,
            createdAt: expect.any(Date),
            fields: [
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Front',
                }),
              ],
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Back',
                }),
              ],
            ],
          }),
        ],
      },
    },
    {
      name: 'when given a filter with a list of IDs and some notes with the given IDs exist, returns the notes that exist',
      fixture: {
        collections: [{ id: 1, name: 'Collection Mock' }],
        notes: [
          {
            id: 2,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
        ],
      },
      input: {
        filter: {
          id: [1, 2],
        },
      },
      expected: {
        cursor: {
          next: undefined,
        },
        notes: [
          expect.objectContaining({
            id: 2,
            reversible: false,
            separable: false,
            createdAt: expect.any(Date),
            fields: [
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Front',
                }),
              ],
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Back',
                }),
              ],
            ],
          }),
        ],
      },
    },
    {
      name: 'when given a filter with a list of IDs and all notes with the given IDs do not exist, returns an empty array',
      fixture: {},
      input: {
        filter: {
          id: [1, 2],
        },
      },
      expected: {
        cursor: {
          next: undefined,
        },
        notes: [],
      },
    },
    {
      name: 'when given a filter with a collection ID and the collection does not exist, returns an empty array',
      fixture: {},
      input: {
        collection: [0],
      },
      expected: {
        cursor: {
          next: undefined,
        },
        notes: [],
      },
    },
    {
      name: 'when given a filter with a collection ID and the collection exists but does not have any notes, returns an empty array',
      fixture: {
        fixture: {
          collections: [{ id: 1, name: 'Collection Mock' }],
          notes: [],
        },
      },
      input: {
        collection: [1],
      },
      expected: {
        cursor: {
          next: undefined,
        },
        notes: [],
      },
    },
    {
      name: 'when given a filter with a collection ID and the collection exists and has notes, returns the notes',
      fixture: {
        collections: [
          { id: 1, name: 'Collection Mock' },
          { id: 2, name: 'Collection Mock' },
        ],
        notes: [
          {
            id: 1,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
          {
            id: 2,
            collections: [2],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
        ],
      },
      input: {
        filter: {
          collection: [1],
        },
      },
      expected: {
        cursor: {
          next: undefined,
        },
        notes: [
          expect.objectContaining({
            id: 1,
            reversible: false,
            separable: false,
            createdAt: expect.any(Date),
            fields: [
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Front',
                }),
              ],
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Back',
                }),
              ],
            ],
          }),
        ],
      },
    },
    {
      name: 'when given a filter with multiple collection IDs, returns the notes of collections with IDs in the list',
      fixture: {
        collections: [
          { id: 1, name: 'Collection Mock' },
          { id: 2, name: 'Collection Mock' },
          { id: 3, name: 'Collection Mock' },
        ],
        notes: [
          {
            id: 1,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
          {
            id: 2,
            collections: [2],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
          {
            id: 3,
            collections: [3],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
        ],
      },
      input: {
        filter: {
          collection: [1, 2],
        },
      },
      expected: {
        cursor: {
          next: undefined,
        },
        notes: [
          expect.objectContaining({
            id: 1,
            reversible: false,
            separable: false,
            createdAt: expect.any(Date),
            fields: [
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Front',
                }),
              ],
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Back',
                }),
              ],
            ],
          }),
          expect.objectContaining({
            id: 2,
            reversible: false,
            separable: false,
            createdAt: expect.any(Date),
            fields: [
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Front',
                }),
              ],
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Back',
                }),
              ],
            ],
          }),
        ],
      },
    },
    {
      name: 'when given an option to order by ID ascending, returns the notes ordered by ID ascending',
      fixture: {
        collections: [{ id: 1, name: 'Collection Mock' }],
        notes: [
          {
            id: 1,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
          {
            id: 2,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
        ],
      },
      input: {
        order: {
          id: 'asc' as const,
        },
      },
      expected: {
        cursor: {
          next: undefined,
        },
        notes: [
          expect.objectContaining({
            id: 1,
            reversible: false,
            separable: false,
            createdAt: expect.any(Date),
            fields: [
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Front',
                }),
              ],
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Back',
                }),
              ],
            ],
          }),
          expect.objectContaining({
            id: 2,
            reversible: false,
            separable: false,
            createdAt: expect.any(Date),
            fields: [
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Front',
                }),
              ],
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Back',
                }),
              ],
            ],
          }),
        ],
      },
    },
    {
      name: 'when given an option to order by ID descending, returns the notes ordered by ID descending',
      fixture: {
        collections: [{ id: 1, name: 'Collection Mock' }],
        notes: [
          {
            id: 1,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
          {
            id: 2,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
        ],
      },
      input: {
        order: {
          id: 'desc' as const,
        },
      },
      expected: {
        cursor: {
          next: undefined,
        },
        notes: [
          expect.objectContaining({
            id: 2,
            reversible: false,
            separable: false,
            createdAt: expect.any(Date),
            fields: [
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Front',
                }),
              ],
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Back',
                }),
              ],
            ],
          }),
          expect.objectContaining({
            id: 1,
            reversible: false,
            separable: false,
            createdAt: expect.any(Date),
            fields: [
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Front',
                }),
              ],
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Back',
                }),
              ],
            ],
          }),
        ],
      },
    },
    {
      name: 'when given a pagination limit and there are more notes than the limit, returns an amount of notes up to the limit',
      fixture: {
        collections: [{ id: 1, name: 'Collection Mock' }],
        notes: [
          {
            id: 1,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
          {
            id: 2,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
        ],
      },
      input: {
        pagination: {
          limit: 1,
        },
      },
      expected: {
        cursor: {
          next: 2,
        },
        notes: [
          expect.objectContaining({
            id: 1,
            reversible: false,
            separable: false,
            createdAt: expect.any(Date),
            fields: [
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Front',
                }),
              ],
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Back',
                }),
              ],
            ],
          }),
        ],
      },
    },
    {
      name: 'when given a pagination cursor, returns notes after the cursor',
      fixture: {
        collections: [{ id: 1, name: 'Collection Mock' }],
        notes: [
          {
            id: 1,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
          {
            id: 2,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
        ],
      },
      input: {
        pagination: {
          cursor: 2,
        },
      },
      expected: {
        cursor: {
          next: undefined,
        },
        notes: [
          expect.objectContaining({
            id: 2,
            reversible: false,
            separable: false,
            createdAt: expect.any(Date),
            fields: [
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Front',
                }),
              ],
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Back',
                }),
              ],
            ],
          }),
        ],
      },
    },
    {
      name: 'when given a pagination cursor and an option to order by ID descending, returns notes before the cursor',
      fixture: {
        collections: [{ id: 1, name: 'Collection Mock' }],
        notes: [
          {
            id: 1,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
          {
            id: 2,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
        ],
      },
      input: {
        order: {
          id: 'desc' as const,
        },
        pagination: {
          cursor: 1,
        },
      },
      expected: {
        cursor: {
          next: undefined,
        },
        notes: [
          expect.objectContaining({
            id: 1,
            reversible: false,
            separable: false,
            createdAt: expect.any(Date),
            fields: [
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Front',
                }),
              ],
              [
                expect.objectContaining({
                  id: expect.any(Number),
                  value: 'Back',
                }),
              ],
            ],
          }),
        ],
      },
    },
    {
      name: 'when given a pagination limit and an option to order by ID ascending, returns the correct cursor',
      fixture: {
        collections: [{ id: 1, name: 'Collection Mock' }],
        notes: [
          {
            id: 1,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
          {
            id: 2,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
        ],
      },
      input: {
        order: {
          id: 'asc' as const,
        },
        pagination: {
          limit: 1,
        },
      },
      expected: expect.objectContaining({
        cursor: {
          next: 2,
        },
      }),
    },
    {
      name: 'when given a pagination limit and an option to order by ID descending, returns the correct cursor',
      fixture: {
        collections: [{ id: 1, name: 'Collection Mock' }],
        notes: [
          {
            id: 1,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
          {
            id: 2,
            collections: [1],
            reversible: false,
            separable: false,
            fields: [
              {
                value: 'Front',
                hash: hashNoteFieldValue('Front'),
                side: 0,
                position: 0,
              },
              {
                value: 'Back',
                hash: hashNoteFieldValue('Back'),
                side: 1,
                position: 0,
              },
            ],
          },
        ],
      },
      input: {
        order: {
          id: 'desc' as const,
        },
        pagination: {
          limit: 1,
        },
      },
      expected: expect.objectContaining({
        cursor: {
          next: 1,
        },
      }),
    },
  ])('$name', async ({ expected, fixture, input }) => {
    const { database, resetDatabaseMock } = await mockDatabase()
    const { default: getNotes } = await import('./getNotes')

    if (fixture.collections) {
      await database.insert(collection).values(fixture.collections)
    }

    await Promise.all(
      fixture.notes?.map(async ({ collections, fields, ...data }) => {
        await database.insert(note).values(data)
        await database
          .insert(collectionToNote)
          .values(
            collections.map((collectionId) => ({
              collection: collectionId,
              note: data.id,
            })),
          )
          .returning()
        await Promise.all(
          fields.map(async (field) => {
            await database.insert(noteField).values({
              note: data.id,
              ...field,
            })
          }),
        )
      }) ?? [],
    )

    const output = await getNotes(input)

    expect(output).toEqual(expected)

    resetDatabaseMock()
  })
})
