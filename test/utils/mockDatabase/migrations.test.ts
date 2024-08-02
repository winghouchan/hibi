import * as mockSchema from './__fixtures__/mock.schema'

jest.doMock('@/database/schema', () => ({ ...mockSchema }))
jest.doMock('drizzle-orm/better-sqlite3/migrator', () => ({
  migrate: jest.fn((database) =>
    jest
      .requireActual('drizzle-orm/better-sqlite3/migrator')
      .migrate(database, {
        migrationsFolder: './test/utils/mockDatabase/__fixtures__/migrations',
      }),
  ),
}))

const mockDatabase = require('.').default
const { nativeDatabase } = mockDatabase()

test('migrations successfully run in database mock', () => {
  expect(
    nativeDatabase
      .prepare(`SELECT name FROM sqlite_master WHERE type = 'table'`)
      .all(),
  ).toEqual([{ name: '__drizzle_migrations' }, { name: 'mock' }])
})
