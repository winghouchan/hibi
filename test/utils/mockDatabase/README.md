# Mocking the database

## Background

The app uses an [OP SQLite database](https://ospfranco.notion.site/OP-SQLite-Documentation-a279a52102464d0cb13c3fa230d2f2dc) to persist some data across sessions. However, when running tests against code that interacts with the database, the OP SQLite database cannot be used because it calls APIs only available on native devices, which the Node.js environment that tests are run in will not have. As a result, the database will need to be mocked.

## Method

### Setting up the mock

The following are mocked:

- The OP SQLite function that creates/opens the database ([`open`](https://ospfranco.notion.site/API-1a39b6bb3eb74eb893d640c8c3459362#032e106271f64ada9ccfb4910384c9e9)). The mocked function returns an SQLite database that is runnable in Node.js. [libSQL](https://github.com/tursodatabase/libsql-client-ts/) was chosen. See [\<projectRoot\>/\_\_mocks\_\_/@op-engineering/op-sqlite.ts](../../../__mocks__/@op-engineering/op-sqlite.ts) for the mock implementation.
- The Drizzle OP SQLite driver. The mocked driver is the driver for libSQL. See [\<projectRoot\>/\_\_mocks\_\_/drizzle-orm/op-sqlite.ts](../../../__mocks__/drizzle-orm/op-sqlite.ts) for the mock implementation.

### Enabling the mock

There are two underlying methods to enable the mock in tests:

#### `jest.mock`

Example:

```typescript
// fn.ts
import { database } from '@/data'

export default async function fn(/* ... */) {
  return await database.insert(/* ... */).values(/* ... */)
}

// fn.test.ts
import fn from './fn'

jest.mock('drizzle-orm/op-sqlite')
jest.mock('@op-engineering/op-sqlite')

test('...', async () => {
  expect(await fn(/* ... */)).toBe(/* ... */)
})
```

#### `jest.doMock` / `jest.unstable_mockModule`

Whilst [`jest.mock`](https://jestjs.io/docs/jest-object#jestmockmodulename-factory-options) works, it does not allow for the resetting of the database mock between test cases. This is because `jest.mock` is hoisted above imports to ensure imported modules use the mock.

```typescript
// This:

import fn from './fn'

test('...', () => {
  jest.mock('drizzle-orm/op-sqlite')
  jest.mock('@op-engineering/op-sqlite')

  /* ... */
})

test('...', () => {
  jest.mock('drizzle-orm/op-sqlite')
  jest.mock('@op-engineering/op-sqlite')

  /* ... */
})

// is equivalent to this:

jest.mock('drizzle-orm/op-sqlite')
jest.mock('@op-engineering/op-sqlite')

import fn from './fn'

test('...', () => {
  /* ... */
})

test('...', () => {
  /* ... */
})
```

Jest provides a function called [`doMock`](https://jestjs.io/docs/jest-object#jestdomockmodulename-factory-options) which does not get hoisted. However, Jest's module registry needs to be reset and modules that consume the mock will have to be re-imported so that they consume the new mock.

```typescript
test('...', () => {
  jest.resetModules()
  jest.doMock('drizzle-orm/op-sqlite')
  jest.doMock('@op-engineering/op-sqlite')

  const fn = require('./fn').default

  /* ... */
})

test('...', () => {
  jest.resetModules()
  jest.doMock('drizzle-orm/op-sqlite')
  jest.doMock('@op-engineering/op-sqlite')

  const fn = require('./fn').default

  /* ... */
})
```

[`unstable_mockModule`](https://jestjs.io/docs/ecmascript-modules) is similar to `doMock` in the way that it is not hoisted. The additional difference is that it provides support for module mocking when using ESM with Jest.

#### Mock database utility function

To improve the ease of creating a database mock, a utility function called [`mockDatabase`](./index.ts) has been created. It does the following:

1. Resets the Jest module registry (`jest.resetModules()`).
2. Enables the mocks (`jest.doMock(...)`).
3. Runs database migrations.
4. Returns the mocked versions of `database`, `nativeDatabase` and a function (`resetDatabaseMock`) that closes the database connection.

Here is some example usage:

##### Called in test case

```typescript
test('`mockDatabase()` opens an in-memory database', async () => {
  const { nativeDatabase, resetDatabaseMock } = await mockDatabase()

  expect(nativeDatabase.open).toBe(true)
  expect(nativeDatabase.memory).toBe(true)

  resetDatabaseMock()
})
```

##### Called in test hook

```typescript
let nativeDatabase: Awaited<ReturnType<typeof mockDatabase>>['nativeDatabase'],
  resetDatabaseMock: Awaited<
    ReturnType<typeof mockDatabase>
  >['resetDatabaseMock']

beforeEach(async () => {
  ;({ nativeDatabase, resetDatabaseMock } = await mockDatabase())
})

afterEach(() => {
  resetDatabaseMock()
})

test('`mockDatabase()` opens an in-memory database', () => {
  expect(nativeDatabase.open).toBe(true)
  expect(nativeDatabase.memory).toBe(true)
})
```

For more examples, see its [tests](./index.test.ts).
