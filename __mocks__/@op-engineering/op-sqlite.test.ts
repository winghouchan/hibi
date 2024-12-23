import { Client } from '@libsql/client'
import { open } from '@op-engineering/op-sqlite'

test('`open()` returns an in-memory database', () => {
  const database = open(
    { name: 'database_mock.db' },
    // Casting is necessary because the database mock, from libSQL, is now
    // returned which has a different structure from OP SQLite.
  ) as unknown as Client

  expect(database).toHaveProperty('closed', false)
  expect(database).toHaveProperty('protocol', 'file')

  database.close()
})
