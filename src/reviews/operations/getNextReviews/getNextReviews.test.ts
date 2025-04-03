import { add, sub } from 'date-fns'
import { collection, collectionToNote } from '@/collections/schema'
import hashNoteFieldValue from '@/notes/hashNoteFieldValue'
import { note, noteField } from '@/notes/schema'
import {
  review,
  reviewable,
  reviewableField,
  reviewableSnapshot,
} from '@/reviews/schema'
import { mockDatabase } from 'test/utils'

describe('getNextReviews', () => {
  describe.each([
    {
      when: '`collections` option is empty and the pagination limit is `1`',
      input: { filter: { collections: [] }, pagination: { limit: 1 } },
    },
    {
      when: '`collections` option only has a collection with no reviewables and the pagination limit is `1`',
      input: { filter: { collections: [1] }, pagination: { limit: 1 } },
    },
    {
      when: '`collections` option has a collection with reviewables and the pagination limit is `1`',
      input: { filter: { collections: [1, 2] }, pagination: { limit: 1 } },
    },
    {
      when: '`due` option is `false` and the pagination limit is `1`',
      input: { filter: { due: false }, pagination: { limit: 1 } },
    },
    {
      when: '`due` option is `true` and the pagination limit is `1`',
      input: { filter: { due: true }, pagination: { limit: 1 } },
    },
    {
      when: '`collections` option is empty and the pagination limit is greater than `1` but less than the number of reviewables if the number of reviewables is greater than `1`',
      input: { filter: { collections: [] }, pagination: { limit: 2 } },
    },
    {
      when: '`collections` option only has a collection with no reviewables and the pagination limit is greater than `1` but less than the number of reviewables if the number of reviewables is greater than `1`',
      input: { filter: { collections: [1] }, pagination: { limit: 2 } },
    },
    {
      when: '`collections` option has a collection with reviewables and the pagination limit is greater than `1` but less than the number of reviewables if the number of reviewables is greater than `1`',
      input: { filter: { collections: [1, 2] }, pagination: { limit: 2 } },
    },
    {
      when: '`due` option is `false` and the pagination limit is greater than `1` but less than the number of reviewables if the number of reviewables is greater than `1`',
      input: { filter: { due: false }, pagination: { limit: 2 } },
    },
    {
      when: '`due` option is `true` and the pagination limit is greater than `1` but less than the number of reviewables if the number of reviewables is greater than `1`',
      input: { filter: { due: true }, pagination: { limit: 2 } },
    },
  ])('when $when', ({ input }) => {
    describe.each([
      {
        and: 'there are no reviewables',
        then: 'returns an empty array',
        fixture: {},
        expected: { reviewables: [] },
      },
      {
        and: 'there is 1 reviewable that has been archived',
        then: 'returns an empty array',
        fixture: {
          collections: [
            { id: 1, name: 'Collection Mock 1' },
            { id: 2, name: 'Collection Mock 2' },
          ],
          notes: [
            {
              id: 1,
              collections: [2],
              reversible: false,
              separable: false,
            },
          ],
          reviewables: [
            {
              id: 1,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front' },
                { side: 1, position: 0, value: 'Back' },
              ],
              archived: true,
              snapshots: [],
            },
          ],
        },
        expected: { reviewables: [] },
      },
      {
        and: 'there is 1 reviewable with no snapshots',
        then:
          input.filter.collections === undefined ||
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2)
            ? 'returns the reviewable'
            : 'returns an empty array',
        fixture: {
          collections: [
            { id: 1, name: 'Collection Mock 1' },
            { id: 2, name: 'Collection Mock 2' },
          ],
          notes: [
            {
              id: 1,
              collections: [2],
              reversible: false,
              separable: false,
            },
          ],
          reviewables: [
            {
              id: 1,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front' },
                { side: 1, position: 0, value: 'Back' },
              ],
              archived: false,
              snapshots: [],
            },
          ],
        },
        expected:
          input.filter.collections === undefined ||
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2)
            ? {
                reviewables: [
                  expect.objectContaining({
                    id: 1,
                    fields: [
                      [expect.objectContaining({ value: 'Front' })],
                      [expect.objectContaining({ value: 'Back' })],
                    ],
                  }),
                ],
              }
            : { reviewables: [] },
      },
      {
        and: 'there is 1 reviewable with 1 snapshot with a due date in the past',
        then:
          input.filter.collections === undefined ||
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2)
            ? 'returns the reviewable'
            : 'returns an empty array',
        fixture: {
          collections: [
            { id: 1, name: 'Collection Mock 1' },
            { id: 2, name: 'Collection Mock 2' },
          ],
          notes: [
            {
              id: 1,
              collections: [2],
              reversible: false,
              separable: false,
            },
          ],
          reviewables: [
            {
              id: 1,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front' },
                { side: 1, position: 0, value: 'Back' },
              ],
              archived: false,
              snapshots: [
                {
                  due: sub(new Date(), { days: 1 }),
                  createdAt: sub(new Date(), { days: 2 }),
                },
              ],
            },
          ],
        },
        expected:
          input.filter.collections === undefined ||
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2)
            ? {
                reviewables: [
                  expect.objectContaining({
                    id: 1,
                    fields: [
                      [expect.objectContaining({ value: 'Front' })],
                      [expect.objectContaining({ value: 'Back' })],
                    ],
                  }),
                ],
              }
            : { reviewables: [] },
      },
      {
        and: 'there is 1 reviewable with 1 snapshot with a due date in the future',
        then:
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2) ||
          input.filter.due === false
            ? 'returns the reviewable'
            : 'returns an empty array',
        fixture: {
          collections: [
            { id: 1, name: 'Collection Mock 1' },
            { id: 2, name: 'Collection Mock 2' },
          ],
          notes: [
            {
              id: 1,
              collections: [2],
              reversible: false,
              separable: false,
            },
          ],
          reviewables: [
            {
              id: 1,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front' },
                { side: 1, position: 0, value: 'Back' },
              ],
              archived: false,
              snapshots: [
                {
                  due: add(new Date(), { days: 1 }),
                  createdAt: sub(new Date(), { days: 2 }),
                },
              ],
            },
          ],
        },
        expected:
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2) ||
          input.filter.due === false
            ? {
                reviewables: [
                  expect.objectContaining({
                    id: 1,
                    fields: [
                      [expect.objectContaining({ value: 'Front' })],
                      [expect.objectContaining({ value: 'Back' })],
                    ],
                  }),
                ],
              }
            : { reviewables: [] },
      },
      {
        and: 'there is 1 reviewable with many snapshots with all due dates in the past',
        then:
          input.filter.collections === undefined ||
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2)
            ? 'returns the reviewable'
            : 'returns an empty array',
        fixture: {
          collections: [
            { id: 1, name: 'Collection Mock 1' },
            { id: 2, name: 'Collection Mock 2' },
          ],
          notes: [
            {
              id: 1,
              collections: [2],
              reversible: false,
              separable: false,
            },
          ],
          reviewables: [
            {
              id: 1,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front' },
                { side: 1, position: 0, value: 'Back' },
              ],
              archived: false,
              snapshots: [
                {
                  due: sub(new Date(), { days: 1 }),
                  createdAt: sub(new Date(), { days: 2 }),
                },
                {
                  due: sub(new Date(), { days: 2 }),
                  createdAt: sub(new Date(), { days: 3 }),
                },
              ],
            },
          ],
        },
        expected:
          input.filter.collections === undefined ||
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2)
            ? {
                reviewables: [
                  expect.objectContaining({
                    id: 1,
                    fields: [
                      [expect.objectContaining({ value: 'Front' })],
                      [expect.objectContaining({ value: 'Back' })],
                    ],
                  }),
                ],
              }
            : { reviewables: [] },
      },
      {
        and: 'there is 1 reviewable with many snapshots with all due dates in the future',
        then:
          input.filter.due === false ||
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2)
            ? 'returns the reviewable'
            : 'returns an empty array',
        fixture: {
          collections: [
            { id: 1, name: 'Collection Mock 1' },
            { id: 2, name: 'Collection Mock 2' },
          ],
          notes: [
            {
              id: 1,
              collections: [2],
              reversible: false,
              separable: false,
            },
          ],
          reviewables: [
            {
              id: 1,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front' },
                { side: 1, position: 0, value: 'Back' },
              ],
              archived: false,
              snapshots: [
                {
                  due: add(new Date(), { days: 1 }),
                  createdAt: sub(new Date(), { days: 2 }),
                },
                {
                  due: add(new Date(), { days: 2 }),
                  createdAt: sub(new Date(), { days: 3 }),
                },
              ],
            },
          ],
        },
        expected:
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2) ||
          input.filter.due === false
            ? {
                reviewables: [
                  expect.objectContaining({
                    id: 1,
                    fields: [
                      [expect.objectContaining({ value: 'Front' })],
                      [expect.objectContaining({ value: 'Back' })],
                    ],
                  }),
                ],
              }
            : { reviewables: [] },
      },
      {
        and: 'there are many reviewables each with 1 snapshot with a due date in the past',
        then:
          input.filter.collections === undefined ||
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2)
            ? 'returns the reviewable with the oldest due date'
            : input.pagination.limit === 2
              ? 'returns reviewables up to the limit sorted by due date ascending'
              : 'returns an empty array',
        fixture: {
          collections: [
            { id: 1, name: 'Collection Mock 1' },
            { id: 2, name: 'Collection Mock 2' },
          ],
          notes: [
            {
              id: 1,
              collections: [2],
              reversible: false,
              separable: false,
            },
          ],
          reviewables: [
            {
              id: 1,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 1' },
                { side: 1, position: 0, value: 'Back 1' },
              ],
              archived: false,
              snapshots: [
                {
                  due: sub(new Date(), { days: 1 }),
                  createdAt: sub(new Date(), { days: 2 }),
                },
              ],
            },
            {
              id: 2,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 2' },
                { side: 1, position: 0, value: 'Back 2' },
              ],
              archived: false,
              snapshots: [
                {
                  due: sub(new Date(), { days: 2 }),
                  createdAt: sub(new Date(), { days: 3 }),
                },
              ],
            },
            {
              id: 3,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 3' },
                { side: 1, position: 0, value: 'Back 3' },
              ],
              archived: false,
              snapshots: [
                {
                  due: new Date(),
                  createdAt: sub(new Date(), { days: 1 }),
                },
              ],
            },
          ],
        },
        expected:
          input.filter.collections === undefined ||
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2)
            ? {
                reviewables: [
                  expect.objectContaining({
                    id: 2,
                    fields: [
                      [expect.objectContaining({ value: 'Front 2' })],
                      [expect.objectContaining({ value: 'Back 2' })],
                    ],
                  }),
                  ...(input.pagination.limit === 2
                    ? [
                        expect.objectContaining({
                          id: 1,
                          fields: [
                            [expect.objectContaining({ value: 'Front 1' })],
                            [expect.objectContaining({ value: 'Back 1' })],
                          ],
                        }),
                      ]
                    : []),
                ],
              }
            : { reviewables: [] },
      },
      {
        and: 'there are many reviewables each with 1 snapshot with some due dates being in the past and some in the future',
        then:
          input.filter.collections === undefined ||
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2)
            ? 'returns the reviewable with the oldest due date'
            : input.pagination.limit === 2
              ? 'returns reviewables up to the limit sorted by due date ascending'
              : 'returns an empty array',
        fixture: {
          collections: [
            { id: 1, name: 'Collection Mock 1' },
            { id: 2, name: 'Collection Mock 2' },
          ],
          notes: [
            {
              id: 1,
              collections: [2],
              reversible: false,
              separable: false,
            },
          ],
          reviewables: [
            {
              id: 1,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 1' },
                { side: 1, position: 0, value: 'Back 1' },
              ],
              archived: false,
              snapshots: [
                {
                  due: sub(new Date(), { days: 1 }),
                  createdAt: sub(new Date(), { days: 2 }),
                },
              ],
            },
            {
              id: 2,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 2' },
                { side: 1, position: 0, value: 'Back 2' },
              ],
              archived: false,
              snapshots: [
                {
                  due: sub(new Date(), { days: 2 }),
                  createdAt: sub(new Date(), { days: 2 }),
                },
              ],
            },
            {
              id: 3,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 3' },
                { side: 1, position: 0, value: 'Back 3' },
              ],
              archived: false,
              snapshots: [
                {
                  due: add(new Date(), { days: 2 }),
                  createdAt: sub(new Date(), { days: 2 }),
                },
              ],
            },
          ],
        },
        expected:
          input.filter.collections === undefined ||
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2)
            ? {
                reviewables: [
                  expect.objectContaining({
                    id: 2,
                    fields: [
                      [expect.objectContaining({ value: 'Front 2' })],
                      [expect.objectContaining({ value: 'Back 2' })],
                    ],
                  }),
                  ...(input.pagination.limit === 2
                    ? [
                        expect.objectContaining({
                          id: 1,
                          fields: [
                            [expect.objectContaining({ value: 'Front 1' })],
                            [expect.objectContaining({ value: 'Back 1' })],
                          ],
                        }),
                      ]
                    : []),
                ],
              }
            : { reviewables: [] },
      },
      {
        and: 'there are many reviewables each with 1 snapshot with a due date in the future',
        then:
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2) ||
          input.filter.due === false
            ? 'returns the reviewable with the oldest due date'
            : input.pagination.limit === 2
              ? 'returns reviewables up to the limit sorted by due date ascending'
              : 'returns an empty array',
        fixture: {
          collections: [
            { id: 1, name: 'Collection Mock 1' },
            { id: 2, name: 'Collection Mock 2' },
          ],
          notes: [
            {
              id: 1,
              collections: [2],
              reversible: false,
              separable: false,
            },
          ],
          reviewables: [
            {
              id: 1,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 1' },
                { side: 1, position: 0, value: 'Back 1' },
              ],
              archived: false,
              snapshots: [
                {
                  due: add(new Date(), { days: 2 }),
                  createdAt: sub(new Date(), { days: 3 }),
                },
              ],
            },
            {
              id: 2,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 2' },
                { side: 1, position: 0, value: 'Back 2' },
              ],
              archived: false,
              snapshots: [
                {
                  due: add(new Date(), { days: 1 }),
                  createdAt: sub(new Date(), { days: 2 }),
                },
              ],
            },
            {
              id: 3,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 3' },
                { side: 1, position: 0, value: 'Back 3' },
              ],
              archived: false,
              snapshots: [
                {
                  due: add(new Date(), { days: 3 }),
                  createdAt: sub(new Date(), { days: 1 }),
                },
              ],
            },
          ],
        },
        expected:
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2) ||
          input.filter.due === false
            ? {
                reviewables: [
                  expect.objectContaining({
                    id: 2,
                    fields: [
                      [expect.objectContaining({ value: 'Front 2' })],
                      [expect.objectContaining({ value: 'Back 2' })],
                    ],
                  }),
                  ...(input.pagination.limit === 2
                    ? [
                        expect.objectContaining({
                          id: 1,
                          fields: [
                            [expect.objectContaining({ value: 'Front 1' })],
                            [expect.objectContaining({ value: 'Back 1' })],
                          ],
                        }),
                      ]
                    : []),
                ],
              }
            : { reviewables: [] },
      },
      {
        and: 'there are many reviewables each with many snapshots with all due dates in the past',
        then:
          input.filter.collections === undefined ||
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2)
            ? 'returns the reviewable where their latest snapshot has the oldest due date'
            : input.pagination.limit === 2
              ? 'returns reviewables up to the limit sorted by due date ascending'
              : 'returns an empty array',
        fixture: {
          collections: [
            { id: 1, name: 'Collection Mock 1' },
            { id: 2, name: 'Collection Mock 2' },
          ],
          notes: [
            {
              id: 1,
              collections: [2],
              reversible: false,
              separable: false,
            },
          ],
          reviewables: [
            {
              id: 1,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 1' },
                { side: 1, position: 0, value: 'Back 1' },
              ],
              archived: false,
              snapshots: [
                {
                  due: sub(new Date(), { days: 1 }),
                  createdAt: sub(new Date(), { days: 2 }),
                },
                {
                  due: sub(new Date(), { days: 2 }),
                  createdAt: sub(new Date(), { days: 3 }),
                },
              ],
            },
            {
              id: 2,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 2' },
                { side: 1, position: 0, value: 'Back 2' },
              ],
              archived: false,
              snapshots: [
                {
                  due: sub(new Date(), { days: 3 }),
                  createdAt: sub(new Date(), { days: 4 }),
                },
                {
                  due: sub(new Date(), { days: 4 }),
                  createdAt: sub(new Date(), { days: 5 }),
                },
              ],
            },
            {
              id: 3,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 3' },
                { side: 1, position: 0, value: 'Back 3' },
              ],
              archived: false,
              snapshots: [
                {
                  due: sub(new Date(), { days: 0, hours: 12 }),
                  createdAt: sub(new Date(), { days: 1 }),
                },
                {
                  due: sub(new Date(), { days: 0, hours: 13 }),
                  createdAt: sub(new Date(), { days: 2 }),
                },
              ],
            },
          ],
        },
        expected:
          input.filter.collections === undefined ||
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2)
            ? {
                reviewables: [
                  expect.objectContaining({
                    id: 2,
                    fields: [
                      [expect.objectContaining({ value: 'Front 2' })],
                      [expect.objectContaining({ value: 'Back 2' })],
                    ],
                  }),
                  ...(input.pagination.limit === 2
                    ? [
                        expect.objectContaining({
                          id: 1,
                          fields: [
                            [expect.objectContaining({ value: 'Front 1' })],
                            [expect.objectContaining({ value: 'Back 1' })],
                          ],
                        }),
                      ]
                    : []),
                ],
              }
            : { reviewables: [] },
      },
      {
        and: 'there are many reviewables each with many snapshots with all due dates in the future',
        then:
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2) ||
          input.filter.due === false
            ? 'returns the reviewable where their latest snapshot has the oldest due date'
            : input.pagination.limit === 2
              ? 'returns reviewables up to the limit sorted by due date ascending'
              : 'returns an empty array',
        fixture: {
          collections: [
            { id: 1, name: 'Collection Mock 1' },
            { id: 2, name: 'Collection Mock 2' },
          ],
          notes: [
            {
              id: 1,
              collections: [2],
              reversible: false,
              separable: false,
            },
          ],
          reviewables: [
            {
              id: 1,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 1' },
                { side: 1, position: 0, value: 'Back 1' },
              ],
              archived: false,
              snapshots: [
                {
                  due: add(new Date(), { days: 4 }),
                  createdAt: sub(new Date(), { days: 5 }),
                },
                {
                  due: add(new Date(), { days: 3 }),
                  createdAt: sub(new Date(), { days: 4 }),
                },
              ],
            },
            {
              id: 2,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 2' },
                { side: 1, position: 0, value: 'Back 2' },
              ],
              archived: false,
              snapshots: [
                {
                  due: add(new Date(), { days: 2 }),
                  createdAt: sub(new Date(), { days: 3 }),
                },
                {
                  due: add(new Date(), { days: 1 }),
                  createdAt: sub(new Date(), { days: 2 }),
                },
              ],
            },
            {
              id: 3,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 3' },
                { side: 1, position: 0, value: 'Back 3' },
              ],
              archived: false,
              snapshots: [
                {
                  due: add(new Date(), { days: 4 }),
                  createdAt: sub(new Date(), { days: 5 }),
                },
                {
                  due: add(new Date(), { days: 5 }),
                  createdAt: sub(new Date(), { days: 6 }),
                },
              ],
            },
          ],
        },
        expected:
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2) ||
          input.filter.due === false
            ? {
                reviewables: [
                  expect.objectContaining({
                    id: 2,
                    fields: [
                      [expect.objectContaining({ value: 'Front 2' })],
                      [expect.objectContaining({ value: 'Back 2' })],
                    ],
                  }),
                  ...(input.pagination.limit === 2
                    ? [
                        expect.objectContaining({
                          id: 1,
                          fields: [
                            [expect.objectContaining({ value: 'Front 1' })],
                            [expect.objectContaining({ value: 'Back 1' })],
                          ],
                        }),
                      ]
                    : []),
                ],
              }
            : { reviewables: [] },
      },
      {
        and: 'there are many reviewables each with many snapshots with some due dates in the past and some in the future',
        then:
          input.filter.collections === undefined ||
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2)
            ? 'returns the reviewable where their latest snapshot has the oldest due date'
            : input.pagination.limit === 2
              ? 'returns reviewables up to the limit sorted by due date ascending'
              : 'returns an empty array',
        fixture: {
          collections: [
            { id: 1, name: 'Collection Mock 1' },
            { id: 2, name: 'Collection Mock 2' },
          ],
          notes: [
            {
              id: 1,
              collections: [2],
              reversible: false,
              separable: false,
            },
          ],
          reviewables: [
            {
              id: 1,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 1' },
                { side: 1, position: 0, value: 'Back 1' },
              ],
              archived: false,
              snapshots: [
                {
                  due: add(new Date(), { days: 1 }),
                  createdAt: sub(new Date(), { days: 2 }),
                },
                {
                  due: add(new Date(), { days: 2 }),
                  createdAt: sub(new Date(), { days: 3 }),
                },
              ],
            },
            {
              id: 2,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 2' },
                { side: 1, position: 0, value: 'Back 2' },
              ],
              archived: false,
              snapshots: [
                {
                  due: sub(new Date(), { days: 2 }),
                  createdAt: sub(new Date(), { days: 3 }),
                },
                {
                  due: sub(new Date(), { days: 3 }),
                  createdAt: sub(new Date(), { days: 4 }),
                },
              ],
            },
            {
              id: 3,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 3' },
                { side: 1, position: 0, value: 'Back 3' },
              ],
              archived: false,
              snapshots: [
                {
                  due: sub(new Date(), { days: 2 }),
                  createdAt: sub(new Date(), { days: 2 }),
                },
                {
                  due: sub(new Date(), { days: 1 }),
                  createdAt: sub(new Date(), { days: 1 }),
                },
              ],
            },
          ],
        },
        expected:
          input.filter.collections === undefined ||
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2)
            ? {
                reviewables: [
                  expect.objectContaining({
                    id: 2,
                    fields: [
                      [expect.objectContaining({ value: 'Front 2' })],
                      [expect.objectContaining({ value: 'Back 2' })],
                    ],
                  }),
                  ...(input.pagination.limit === 2
                    ? [
                        expect.objectContaining({
                          id: 3,
                          fields: [
                            [expect.objectContaining({ value: 'Front 3' })],
                            [expect.objectContaining({ value: 'Back 3' })],
                          ],
                        }),
                      ]
                    : []),
                ],
              }
            : { reviewables: [] },
      },
      {
        and: 'there are many reviewables each with many snapshots that have interleaved created and due dates',
        then:
          input.filter.collections === undefined ||
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2)
            ? 'returns the reviewable where their latest snapshot has the oldest due date'
            : input.pagination.limit === 2
              ? 'returns reviewables up to the limit sorted by due date ascending'
              : 'returns an empty array',
        fixture: {
          collections: [
            { id: 1, name: 'Collection Mock 1' },
            { id: 2, name: 'Collection Mock 2' },
          ],
          notes: [
            {
              id: 1,
              collections: [2],
              reversible: false,
              separable: false,
            },
          ],
          reviewables: [
            {
              id: 1,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 1' },
                { side: 1, position: 0, value: 'Back 1' },
              ],
              archived: false,
              snapshots: [
                {
                  due: sub(new Date(), { days: 1 }),
                  createdAt: sub(new Date(), { days: 2 }),
                },
                {
                  due: sub(new Date(), { days: 4 }),
                  createdAt: sub(new Date(), { days: 5 }),
                },
              ],
            },
            {
              id: 2,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 2' },
                { side: 1, position: 0, value: 'Back 2' },
              ],
              archived: false,
              snapshots: [
                {
                  due: sub(new Date(), { days: 2 }),
                  createdAt: sub(new Date(), { days: 3 }),
                },
                {
                  due: sub(new Date(), { days: 3 }),
                  createdAt: sub(new Date(), { days: 4 }),
                },
              ],
            },
            {
              id: 3,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 2' },
                { side: 1, position: 0, value: 'Back 2' },
              ],
              archived: false,
              snapshots: [
                {
                  due: add(new Date(), { days: 1 }),
                  createdAt: sub(new Date(), { days: 3 }),
                },
                {
                  due: add(new Date(), { days: 2 }),
                  createdAt: sub(new Date(), { days: 4 }),
                },
              ],
            },
          ],
        },
        expected:
          input.filter.collections === undefined ||
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2)
            ? {
                reviewables: [
                  expect.objectContaining({
                    id: 2,
                    fields: [
                      [expect.objectContaining({ value: 'Front 2' })],
                      [expect.objectContaining({ value: 'Back 2' })],
                    ],
                  }),
                  ...(input.pagination.limit === 2
                    ? [
                        expect.objectContaining({
                          id: 1,
                          fields: [
                            [expect.objectContaining({ value: 'Front 1' })],
                            [expect.objectContaining({ value: 'Back 1' })],
                          ],
                        }),
                      ]
                    : []),
                ],
              }
            : { reviewables: [] },
      },
      {
        and: 'there are many reviewables with some having snapshots with due dates in the past and some having no snapshots',
        then:
          input.filter.collections === undefined ||
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2)
            ? 'returns the reviewable where their latest snapshot has the oldest due date'
            : input.pagination.limit === 2
              ? 'returns reviewables up to the limit sorted by due date ascending'
              : 'returns an empty array',
        fixture: {
          collections: [
            { id: 1, name: 'Collection Mock 1' },
            { id: 2, name: 'Collection Mock 2' },
          ],
          notes: [
            {
              id: 1,
              collections: [2],
              reversible: false,
              separable: false,
            },
          ],
          reviewables: [
            {
              id: 1,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 1' },
                { side: 1, position: 0, value: 'Back 1' },
              ],
              archived: false,
              snapshots: [],
            },
            {
              id: 2,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 2' },
                { side: 1, position: 0, value: 'Back 2' },
              ],
              archived: false,
              snapshots: [
                {
                  due: sub(new Date(), { days: 2 }),
                  createdAt: sub(new Date(), { days: 2 }),
                },
              ],
            },
            {
              id: 3,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 3' },
                { side: 1, position: 0, value: 'Back 3' },
              ],
              archived: false,
              snapshots: [
                {
                  due: sub(new Date(), { days: 1 }),
                  createdAt: sub(new Date(), { days: 2 }),
                },
              ],
            },
          ],
        },
        expected:
          input.filter.collections === undefined ||
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2)
            ? {
                reviewables: [
                  expect.objectContaining({
                    id: 2,
                    fields: [
                      [expect.objectContaining({ value: 'Front 2' })],
                      [expect.objectContaining({ value: 'Back 2' })],
                    ],
                  }),
                  ...(input.pagination.limit === 2
                    ? [
                        expect.objectContaining({
                          id: 3,
                          fields: [
                            [expect.objectContaining({ value: 'Front 3' })],
                            [expect.objectContaining({ value: 'Back 3' })],
                          ],
                        }),
                      ]
                    : []),
                ],
              }
            : { reviewables: [] },
      },
      {
        and: 'there are many reviewables with some having snapshots with due dates in the future and some having no snapshots',
        then:
          input.filter.collections === undefined ||
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2)
            ? 'returns the reviewable with no snapshot'
            : input.pagination.limit === 2
              ? 'returns reviewables up to the limit sorted by due date ascending'
              : 'returns an empty array',
        fixture: {
          collections: [
            { id: 1, name: 'Collection Mock 1' },
            { id: 2, name: 'Collection Mock 2' },
          ],
          notes: [
            {
              id: 1,
              collections: [2],
              reversible: false,
              separable: false,
            },
          ],
          reviewables: [
            {
              id: 1,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 1' },
                { side: 1, position: 0, value: 'Back 1' },
              ],
              archived: false,
              snapshots: [
                {
                  due: add(new Date(), { days: 1 }),
                  createdAt: sub(new Date(), { days: 2 }),
                },
              ],
            },
            {
              id: 2,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 2' },
                { side: 1, position: 0, value: 'Back 2' },
              ],
              archived: false,
              snapshots: [],
            },
            {
              id: 3,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 3' },
                { side: 1, position: 0, value: 'Back 3' },
              ],
              archived: false,
              snapshots: [],
            },
          ],
        },
        expected:
          input.filter.collections === undefined ||
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2)
            ? {
                reviewables: [
                  expect.objectContaining({
                    id: 2,
                    fields: [
                      [expect.objectContaining({ value: 'Front 2' })],
                      [expect.objectContaining({ value: 'Back 2' })],
                    ],
                  }),
                  ...(input.pagination.limit === 2
                    ? [
                        expect.objectContaining({
                          id: 3,
                          fields: [
                            [expect.objectContaining({ value: 'Front 3' })],
                            [expect.objectContaining({ value: 'Back 3' })],
                          ],
                        }),
                      ]
                    : []),
                ],
              }
            : { reviewables: [] },
      },
      {
        and: 'there are many reviewables with some having snapshots with due dates in the past, some with due dates in the future and some having no snapshots',
        then:
          input.filter.collections === undefined ||
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2)
            ? 'returns the reviewable where their latest snapshot has the oldest due date'
            : input.pagination.limit === 2
              ? 'returns reviewables up to the limit sorted by due date ascending'
              : 'returns an empty array',
        fixture: {
          collections: [
            { id: 1, name: 'Collection Mock 1' },
            { id: 2, name: 'Collection Mock 2' },
          ],
          notes: [
            {
              id: 1,
              collections: [2],
              reversible: false,
              separable: false,
            },
          ],
          reviewables: [
            {
              id: 1,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 1' },
                { side: 1, position: 0, value: 'Back 1' },
              ],
              archived: false,
              snapshots: [],
            },
            {
              id: 2,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 2' },
                { side: 1, position: 0, value: 'Back 2' },
              ],
              archived: false,
              snapshots: [
                {
                  due: add(new Date(), { days: 1 }),
                  createdAt: sub(new Date(), { days: 2 }),
                },
              ],
            },
            {
              id: 3,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 3' },
                { side: 1, position: 0, value: 'Back 3' },
              ],
              archived: false,
              snapshots: [
                {
                  due: sub(new Date(), { days: 1 }),
                  createdAt: sub(new Date(), { days: 2 }),
                },
              ],
            },
          ],
        },
        expected:
          input.filter.collections === undefined ||
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2)
            ? {
                reviewables: [
                  expect.objectContaining({
                    id: 3,
                    fields: [
                      [expect.objectContaining({ value: 'Front 3' })],
                      [expect.objectContaining({ value: 'Back 3' })],
                    ],
                  }),
                  ...(input.pagination.limit === 2
                    ? [
                        expect.objectContaining({
                          id: 1,
                          fields: [
                            [expect.objectContaining({ value: 'Front 1' })],
                            [expect.objectContaining({ value: 'Back 1' })],
                          ],
                        }),
                      ]
                    : []),
                ],
              }
            : { reviewables: [] },
      },
      {
        and: 'there are many reviewables each with 1 snapshot with a due date in the past with some reviewables being archived',
        then:
          input.filter.collections === undefined ||
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2)
            ? 'returns the reviewable with the oldest due date that is not archived'
            : input.pagination.limit === 2
              ? 'returns reviewables up to the limit sorted by due date ascending'
              : 'returns an empty array',
        fixture: {
          collections: [
            { id: 1, name: 'Collection Mock 1' },
            { id: 2, name: 'Collection Mock 2' },
          ],
          notes: [
            {
              id: 1,
              collections: [2],
              reversible: false,
              separable: false,
            },
          ],
          reviewables: [
            {
              id: 1,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 1' },
                { side: 1, position: 0, value: 'Back 1' },
              ],
              archived: false,
              snapshots: [
                {
                  due: sub(new Date(), { days: 2 }),
                  createdAt: sub(new Date(), { days: 2 }),
                },
              ],
            },
            {
              id: 2,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 2' },
                { side: 1, position: 0, value: 'Back 2' },
              ],
              archived: true,
              snapshots: [
                {
                  due: sub(new Date(), { days: 2 }),
                  createdAt: sub(new Date(), { days: 3 }),
                },
              ],
            },
            {
              id: 3,
              note: 1,
              fields: [
                { side: 0, position: 0, value: 'Front 3' },
                { side: 1, position: 0, value: 'Back 3' },
              ],
              archived: false,
              snapshots: [
                {
                  due: sub(new Date(), { days: 1 }),
                  createdAt: sub(new Date(), { days: 2 }),
                },
              ],
            },
          ],
        },
        expected:
          input.filter.collections === undefined ||
          input.filter.collections?.length === 0 ||
          input.filter.collections?.includes(2)
            ? {
                reviewables: [
                  expect.objectContaining({
                    id: 1,
                    fields: [
                      [expect.objectContaining({ value: 'Front 1' })],
                      [expect.objectContaining({ value: 'Back 1' })],
                    ],
                  }),
                  ...(input.pagination.limit === 2
                    ? [
                        expect.objectContaining({
                          id: 3,
                          fields: [
                            [expect.objectContaining({ value: 'Front 3' })],
                            [expect.objectContaining({ value: 'Back 3' })],
                          ],
                        }),
                      ]
                    : []),
                ],
              }
            : { reviewables: [] },
      },
    ])('and $and', ({ then, fixture, expected }) => {
      test(
        // eslint-disable-next-line jest/valid-title -- `then` is a string
        then,
        async () => {
          const { database, resetDatabaseMock } = await mockDatabase()
          const { default: getNextReviews } = await import('./getNextReviews')

          await Promise.all(
            fixture.collections?.map(
              async (data) => await database.insert(collection).values(data),
            ) ?? [],
          )

          await Promise.all(
            fixture.notes?.map(async ({ collections, ...data }) => {
              const [{ id: noteId }] = await database
                .insert(note)
                .values(data)
                .returning()

              await Promise.all(
                collections.map(
                  async (collectionId) =>
                    await database
                      .insert(collectionToNote)
                      .values({ collection: collectionId, note: noteId }),
                ),
              )
            }) ?? [],
          )

          await Promise.all(
            fixture.reviewables?.map(
              async ({ archived, id, fields, note: noteId, snapshots }) => {
                const [{ id: reviewableId }] = await database
                  .insert(reviewable)
                  .values({ id, note: noteId, archived })
                  .returning()

                await Promise.all(
                  fields.map(async (field) => {
                    const [{ id: noteFieldId }] = await database
                      .insert(noteField)
                      .values({
                        note: noteId,
                        hash: hashNoteFieldValue(field.value),
                        ...field,
                      })
                      .returning()

                    await database.insert(reviewableField).values({
                      reviewable: reviewableId,
                      field: noteFieldId,
                      side: field.side,
                    })
                  }),
                )

                await Promise.all(
                  snapshots.map(async ({ due, createdAt }) => {
                    const [{ id: reviewId }] = await database
                      .insert(review)
                      .values({
                        reviewable: reviewableId,

                        // The values below are not significant to the test
                        rating: 1,
                        duration: 1,
                        retention: 1,
                        dueFuzzed: false,
                        learningEnabled: false,
                        maxInterval: 100,
                        weights: Array.from({ length: 19 }, () => 1),
                      })
                      .returning()

                    await database.insert(reviewableSnapshot).values({
                      reviewable: reviewableId,
                      review: reviewId,
                      createdAt,
                      due,

                      // The values below are not significant to the test
                      difficulty: 1,
                      stability: 1,
                      state: 1,
                    })
                  }),
                )
              },
            ) ?? [],
          )

          const output = await getNextReviews(input)

          expect(output).toEqual(expected)

          resetDatabaseMock()
        },
      )
    })
  })

  describe('when the note field side and reviewable field side differ', () => {
    it('returns the fields with the reviewable side, ordered by the reviewable field side and note field position ascending', async () => {
      const { database, resetDatabaseMock } = await mockDatabase()
      const { default: getNextReviews } = await import('./getNextReviews')

      const fixture = {
        reviewable: {
          fields: [{ side: 1 }, { side: 1 }, { side: 0 }, { side: 0 }],
        },
        note: {
          fields: [
            { side: 0, position: 0, value: 'A' },
            { side: 0, position: 1, value: 'B' },
            { side: 1, position: 0, value: 'C' },
            { side: 1, position: 1, value: 'D' },
          ],
        },
      }

      const [{ id: collectionId }] = await database
        .insert(collection)
        .values({
          name: 'Collection Mock',
        })
        .returning()

      const [{ id: noteId }] = await database
        .insert(note)
        .values({}) // The values are not significant to the test
        .returning()

      const [{ id: reviewableId }] = await database
        .insert(reviewable)
        .values({ note: noteId })
        .returning()

      const noteFields = await database
        .insert(noteField)
        .values(
          fixture.note.fields.map((field) => ({
            hash: hashNoteFieldValue(field.value),
            note: noteId,
            ...field,
          })),
        )
        .returning()

      await database.insert(reviewableField).values(
        fixture.reviewable.fields.map((field, index) => ({
          reviewable: reviewableId,
          field: noteFields[index].id,
          ...field,
        })),
      )

      await database
        .insert(collectionToNote)
        .values({ collection: collectionId, note: noteId })

      const output = await getNextReviews()

      expect(output).toEqual({
        reviewables: [
          expect.objectContaining({
            fields: [
              [
                expect.objectContaining({
                  side: 0,
                  position: 0,
                  value: 'C',
                }),
                expect.objectContaining({
                  side: 0,
                  position: 1,
                  value: 'D',
                }),
              ],
              [
                expect.objectContaining({
                  side: 1,
                  position: 0,
                  value: 'A',
                }),
                expect.objectContaining({
                  side: 1,
                  position: 1,
                  value: 'B',
                }),
              ],
            ],
          }),
        ],
      })

      resetDatabaseMock()
    })
  })
})
