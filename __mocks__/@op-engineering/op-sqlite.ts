import { jest } from '@jest/globals'
import { createClient } from '@libsql/client'

/**
 * Mock of OP SQLite's function to synchronously open/create a database. OP
 * SQLite cannot be run in a Node.js environment as it runs native device code.
 * The mock constructs an in-memory database using libSQL, which can be run in
 * a Node.js environment.
 *
 * @see {@link https://docs.turso.tech/sdk/ts/quickstart | libSQL Documentation}
 * @see {@link https://github.com/OP-Engineering/op-sqlite | OP SQLite Source Code}
 * @see {@link https://ospfranco.notion.site/API-1a39b6bb3eb74eb893d640c8c3459362#032e106271f64ada9ccfb4910384c9e9 | OP SQLite `open` Documentation}
 */
export const open = jest.fn(() => createClient({ url: 'file::memory:' }))
