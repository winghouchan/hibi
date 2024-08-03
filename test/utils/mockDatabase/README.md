# Mocking the database

## Background

The app uses [Expo's SQLite database](https://docs.expo.dev/versions/latest/sdk/sqlite/) to persist some data across sessions. However, when running tests against code that interacts with the database, Expo's SQLite database cannot be used because it calls APIs only available on native devices, which the Node.js environment that tests are run in will not have. The following error will be thrown:

> ```
> TypeError: _ExpoSQLiteNext.default.NativeDatabase is not a constructor
> ```

The relevant source code from Expo can be found here:

- [TypeScript](https://github.com/expo/expo/blob/sdk-51/packages/expo-sqlite/src/ExpoSQLiteNext.native.ts)
- [Android](https://github.com/expo/expo/blob/sdk-51/packages/expo-sqlite/android/src/main/java/expo/modules/sqlite/NativeDatabase.kt)
- [iOS](https://github.com/expo/expo/blob/sdk-51/packages/expo-sqlite/ios/NativeDatabase.swift)

As a result, the database will need to be mocked.

## Method

### Setting up the mock

The following are mocked:

- The Expo SQLite function that creates/opens the database ([`openDatabaseSync`](https://docs.expo.dev/versions/latest/sdk/sqlite/#sqliteopendatabasesyncdatabasename-options)). The mocked function returns an SQLite database that is runnable in Node.js. [Better SQLite 3](https://github.com/WiseLibs/better-sqlite3) was chosen. See [\<projectRoot\>/\_\_mocks\_\_/expo-sqlite/index.ts](../../../__mocks__/expo-sqlite/index.ts) for the mock implementation.
- The Drizzle Expo SQLite driver. The mocked driver is the driver for Better SQLite 3. See [\<projectRoot\>/\_\_mocks\_\_/drizzle-orm/expo-sqlite.ts](../../../__mocks__/drizzle-orm/expo-sqlite.ts) for the mock implementation.

### Enabling the mock

There are two underlying methods to enable the mock in tests:

#### `jest.mock`

Example:

```typescript
// fn.ts
import { database } from '@/database'

export default async function fn(/* ... */) {
  return await database.insert(/* ... */).values(/* ... */)
}

// fn.test.ts
import fn from './fn'

jest.mock('drizzle-orm/expo-sqlite')
jest.mock('expo-sqlite')

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
  jest.mock('drizzle-orm/expo-sqlite')
  jest.mock('expo-sqlite')

  /* ... */
})

test('...', () => {
  jest.mock('drizzle-orm/expo-sqlite')
  jest.mock('expo-sqlite')

  /* ... */
})

// is equivalent to this:

jest.mock('drizzle-orm/expo-sqlite')
jest.mock('expo-sqlite')

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
  jest.doMock('drizzle-orm/expo-sqlite')
  jest.doMock('expo-sqlite')

  const fn = require('./fn').default

  /* ... */
})

test('...', () => {
  jest.resetModules()
  jest.doMock('drizzle-orm/expo-sqlite')
  jest.doMock('expo-sqlite')

  const fn = require('./fn').default

  /* ... */
})
```

[`unstable_mockModule`](https://jestjs.io/docs/ecmascript-modules) is similar to `doMock` in the way that it is not hoisted. The additional difference is that it provides support for module mocking when using ESM with Jest.

#### Mock database utility function

To improve the ease of creating a database mock, a utility function called [`mockDatabase`](./index.ts) has been created. It does the following:

1. Resets the Jest module registry (`jest.resetModules()`).
2. Enables the mocks (`jest.unstable_mockModule(...)`).
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
