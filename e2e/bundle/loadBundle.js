/* global appId BUNDLE_SERVER_HOSTNAME BUNDLE_SERVER_PORT http */

/**
 * Hostname for the server that loads the bundle.
 *
 * Make sure the default matches the default specified in `server.ts`.
 */
const HOSTNAME = BUNDLE_SERVER_HOSTNAME ?? '127.0.0.1'

/**
 * Port for the server that loads the bundle.
 *
 * Make sure the default matches the default specified in `server.ts`.
 */
const PORT = BUNDLE_SERVER_PORT ?? 9005

const response = http.post(`http://${HOSTNAME}:${PORT}`, {
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    appId: appId,
  }),
})

console.log(response.body)
