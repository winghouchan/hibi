import Database from 'better-sqlite3'

const database = new Database(':memory:')

database
  .prepare(`CREATE TABLE mock_table (mock_column INTEGER PRIMARY KEY)`)
  .run()

database.prepare(`INSERT INTO mock_table (mock_column) VALUES (1)`).run()

export default database.serialize()
