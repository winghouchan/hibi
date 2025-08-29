import { Serve, argv, spawn } from 'bun'
import debug from 'debug'
import { cp } from 'node:fs/promises'
import { parseArgs } from 'util'

const log = debug('bundle')

const { values: args } = parseArgs({
  args: argv,
  options: {
    port: { type: 'string' },
    hostname: { type: 'string' },
  },
  allowPositionals: true,
  strict: true,
})

/**
 * Hostname for the server that loads the bundle.
 *
 * Make sure the default matches the default specified in `loadBundle.js`.
 */
const HOSTNAME = args.hostname ?? '127.0.0.1'

/**
 * Port for the server that loads the bundle.
 *
 * Make sure the default matches the default specified in `loadBundle.js`.
 */
const PORT = args.port ? Number(args.port) : 9005

/**
 * The data for a single device  returned by `xcrun simctl list devices --json`.
 *
 * It is possible to filter for devices that are booted. Use the `State` type
 * parameter to narrow the type for `state`.
 *
 * It is possible to filter for devices that are available. Use the `Availability`
 * type parameter to narrow the type for `isAvailable`. Booted devices will always
 * be available.
 */
interface IosDevice<
  State extends 'Booted' | 'Shutdown' = 'Booted' | 'Shutdown',
  Availability extends State extends 'Booted'
    ? true
    : boolean = State extends 'Booted' ? true : boolean,
> {
  dataPath: string
  dataPathSize: number
  deviceTypeIdentifier: string
  isAvailable: Availability
  lastBootedAt: string
  logPath: string
  logPathSize: number
  name: string
  state: State
  udid: string
}

async function getIosDevices() {
  try {
    const devices = Object.values<IosDevice<'Booted'>[]>(
      (
        await new Response(
          spawn([
            'xcrun',
            'simctl',
            'list',
            'devices',
            'booted',
            '--json',
          ]).stdout,
        ).json()
      ).devices,
    ).reduce((accumulator, value) => [...accumulator, ...value], [])

    if (devices.length) {
      log('Found iOS devices', {
        devices: devices.map(({ udid }) => udid),
      })
    } else {
      log('No iOS devices found')
    }

    return devices
  } catch (error) {
    log('Unable to get iOS devices. Reason:', error)

    return undefined
  }
}

async function getIosAppDataContainer(udid: string, appId: string) {
  try {
    return (
      await new Response(
        spawn([
          'xcrun',
          'simctl',
          'get_app_container',
          udid,
          appId,
          'data',
        ]).stdout,
      ).text()
    ).trimEnd()
  } catch (error) {
    log('Unable to get iOS app data container. Reason:', error)

    return undefined
  }
}

export default {
  hostname: HOSTNAME,
  port: PORT,

  async fetch(request) {
    try {
      const bundleDirectory = '.expo-internal'
      const tempDirectory = './e2e/bundle/tmp'
      const { appId } = await request.json()

      if (!appId) {
        return Response.json({ error: ['Missing `appId`'] }, { status: 422 })
      }

      const iosDevices = await getIosDevices()

      if (!iosDevices?.length) {
        log('No devices to copy bundle to')

        return Response.json({ message: 'OK' }, { status: 200 })
      }

      await Promise.all(
        iosDevices.map(async ({ udid }) => {
          const source = `${tempDirectory}/${bundleDirectory}`
          const destination = `${await getIosAppDataContainer(udid, appId)}/Library/Application Support/${bundleDirectory}`

          log(`Copying ${source} to ${destination}`)

          await cp(source, destination, { recursive: true })
        }),
      )

      log('Copied bundle to iOS devices')

      return Response.json({ message: 'OK' }, { status: 200 })
    } catch (error) {
      log(error)

      return Response.json(error, { status: 500 })
    }
  },
} satisfies Serve
