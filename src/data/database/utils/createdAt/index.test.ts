import { jest } from '@jest/globals'
import { sql } from 'drizzle-orm'

// @ts-ignore: "error TS7022: 'defaultFn' implicitly has type 'any' because it
// does not have a type annotation and is referenced directly or indirectly in
// its own initializer." This error is only thrown when running tests. In the
// IDE, the types are correctly inferred.
const defaultFn = jest.fn(() => ({
  defaultFn,
  notNull,
}))
// @ts-ignore: "error TS7022: 'notNull' implicitly has type 'any' because it
// does not have a type annotation and is referenced directly or indirectly in
// its own initializer." This error is only thrown when running tests. In the
// IDE, the types are correctly inferred.
const notNull = jest.fn(() => ({
  default: defaultFn,
  notNull,
}))
const integer = jest.fn(() => ({
  notNull,
}))

jest.unstable_mockModule('drizzle-orm/sqlite-core', () => ({
  integer,
}))

const { default: createdAt } = await import('.')

describe('createdAt', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('when not provided a column name, declares a non-nullable column with the default column name and a default value of milliseconds since Unix epoch', () => {
    createdAt()

    expect(integer).toHaveBeenCalledExactlyOnceWith('created_at', {
      mode: 'timestamp_ms',
    })
    expect(notNull).toHaveBeenCalledOnce()
    expect(defaultFn).toHaveBeenCalledExactlyOnceWith(
      sql`(unixepoch('now', 'subsec') * 1000)`,
    )
  })

  it('when provided a column name, declares a non-nullable column with the configured column name and a default value of milliseconds since Unix epoch', () => {
    const columnName = 'custom_created_at'

    createdAt(columnName)

    expect(integer).toHaveBeenCalledExactlyOnceWith(columnName, {
      mode: 'timestamp_ms',
    })
    expect(notNull).toHaveBeenCalledOnce()
    expect(defaultFn).toHaveBeenCalledExactlyOnceWith(
      sql`(unixepoch('now', 'subsec') * 1000)`,
    )
  })
})
