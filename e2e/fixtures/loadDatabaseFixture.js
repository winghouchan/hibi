/* global appId DATABASE_FIXTURE_SERVER_HOSTNAME DATABASE_FIXTURE_SERVER_PORT databaseFixture http */

/**
 * Hostname for the server that loads database fixtures.
 *
 * Make sure the default matches the default specified in `server.ts`.
 */
const HOSTNAME = DATABASE_FIXTURE_SERVER_HOSTNAME ?? '127.0.0.1'

/**
 * Port for the server that loads database fixtures.
 *
 * Make sure the default matches the default specified in `server.ts`.
 */
const PORT = DATABASE_FIXTURE_SERVER_PORT ?? 9004

const response = http.post(`http://${HOSTNAME}:${PORT}`, {
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    appId: appId,
    databaseFixture: databaseFixture,
  }),
})

console.log(response.body)
