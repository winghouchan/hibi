import { jest } from '@jest/globals'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as mockSchema from './__fixtures__/mock.schema'

/**
 * The actual application schema should not be used for these tests so its
 * implementation and the function that does the migration have been mocked out.
 */
jest.unstable_mockModule('@/database/schema', () => ({
  default: { ...mockSchema },
}))
jest.unstable_mockModule('drizzle-orm/better-sqlite3/migrator', () => ({
  migrate: jest.fn((...[database]: Parameters<typeof migrate>) =>
    migrate(database, {
      migrationsFolder: './test/utils/mockDatabase/__fixtures__/migrations',
    }),
  ),
}))

const { default: mockDatabase } = await import('./index')
const { nativeDatabase } = await mockDatabase()

test('migrations successfully run in database mock', () => {
  expect(
    nativeDatabase
      .prepare(`SELECT name FROM sqlite_master WHERE type = 'table'`)
      .all(),
  ).toEqual([{ name: '__drizzle_migrations' }, { name: 'mock' }])
})
