import debug from 'debug'
import assets from './assets'
import manifest from './manifest'

const log = debug('create-update-bundle:root')

if (typeof process.env.UPDATES_URL === 'undefined') {
  throw new Error('UPDATES_URL environment variable needs to be set')
}

const updatesUrl = new URL(process.env.UPDATES_URL)

log(`Bundle server started. Listening on "${updatesUrl.origin}".`)

Bun.serve({
  hostname: updatesUrl.hostname,
  port: updatesUrl.port,

  routes: {
    '/assets': { GET: assets },
    '/manifest': { GET: manifest },
  },

  async fetch() {
    return new Response(undefined, { status: 404 })
  },
})
