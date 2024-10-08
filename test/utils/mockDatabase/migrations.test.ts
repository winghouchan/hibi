import { jest } from '@jest/globals'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as mockSchema from './__fixtures__/mock.schema'
import type MockDatabaseFn from '.'

let nativeDatabase: Awaited<
    ReturnType<typeof MockDatabaseFn>
  >['nativeDatabase'],
  resetDatabaseMock: Awaited<
    ReturnType<typeof MockDatabaseFn>
  >['resetDatabaseMock']

beforeEach(async () => {
  /**
   * The actual application schema should not be used for these tests so its
   * implementation and the function that does the migration have been mocked out.
   */
  jest.doMock('@/data/database/schema', () => ({
    default: { ...mockSchema },
  }))
  jest.doMock('drizzle-orm/better-sqlite3/migrator', () => ({
    migrate: jest.fn((...[database]: Parameters<typeof migrate>) =>
      migrate(database, {
        migrationsFolder: './test/utils/mockDatabase/__fixtures__/migrations',
      }),
    ),
  }))

  const { default: mockDatabase } = await import('.')
  ;({ nativeDatabase, resetDatabaseMock } = await mockDatabase())
})

afterEach(() => {
  resetDatabaseMock()
})

test('migrations successfully run in database mock', async () => {
  expect(
    nativeDatabase
      .prepare(`SELECT name FROM sqlite_master WHERE type = 'table'`)
      .all(),
  ).toEqual([{ name: '__drizzle_migrations' }, { name: 'mock' }])
})
