import { createClient } from '@libsql/client'
import { Serve, argv, file, spawn, write } from 'bun'
import { mock } from 'bun:test'
import debug from 'debug'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { mkdir, unlink } from 'node:fs/promises'
import { parseArgs } from 'util'
import schema from '@/data/database/schema'

const log = debug('fixtures')

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
 * Hostname for the server that loads database fixtures.
 *
 * Make sure the default matches the default specified in `loadDatabaseFixture.js`.
 */
const HOSTNAME = args.hostname ?? '127.0.0.1'

/**
 * Port for the server that loads database fixtures.
 *
 * Make sure the default matches the default specified in `loadDatabaseFixture.js`.
 */
const PORT = args.port ? Number(args.port) : 9004

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
}

async function getIosAppDataContainer(udid: string, appId: string) {
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
}

async function getAndroidDevices() {
  /**
   * List of attached Android device serial numbers.
   *
   * `adb devices` returns data in plaintext in the following format:
   *
   * ```text
   * List of devices attached
   * <serial 1>\t<state 1>
   * ...
   * <serial n>\t<state n>
   *
   * ```
   */
  const devices = (await new Response(spawn(['adb', 'devices']).stdout).text())
    // Removes the line terminator
    .trimEnd()
    // Each device is separated by a line feed
    .split('\n')
    // Ignores first line of `adb devices` output which reads "List of devices attached"
    .slice(1)
    // Gets the device serial for each device, separating it from the device state
    .map((value) => value.split('\t').slice(0, 1).join(''))

  if (devices.length) {
    log('Found Android devices', { devices })
  } else {
    log('No Android devices found')
  }

  return devices
}

function hasErrorCode(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  )
}

export default {
  hostname: HOSTNAME,
  port: PORT,

  async fetch(request) {
    try {
      const databaseDirectory = `${import.meta.dir}/tmp`
      const databasePath = `${databaseDirectory}/app.db`
      const { appId, databaseFixture: name } = await request.json()

      if (!appId || !name) {
        return Response.json(
          {
            error: [
              ...(!appId ? ['Missing `appId`'] : []),
              ...(!name ? ['Missing `databaseFixture`'] : []),
            ],
          },
          { status: 422 },
        )
      }

      log('Loading database fixture', { name })

      try {
        log('Deleting temp data')

        await unlink(databasePath)

        log('Temp data deleted')
      } catch (error) {
        if (hasErrorCode(error) && error.code === 'ENOENT') {
          log('No temp data')
        } else {
          throw error
        }
      }

      await mkdir(databaseDirectory, { recursive: true })

      const nativeDatabase = createClient({ url: `file:${databasePath}` })
      const database = drizzle(nativeDatabase, {
        casing: 'snake_case',
        schema,
      })

      mock.module('@/data/database', () => ({
        database,
        nativeDatabase,
        tracer: {
          withSpan:
            (_: unknown, operation: Function) =>
            async (...args: any[]) =>
              operation(...args),
        },
      }))

      log('Applying migrations')

      await migrate(database, {
        migrationsFolder: 'src/data/database/migrations',
      })

      log('Applied migrations')

      const { default: fixture } = await import(`./${name}`)

      log('Applying fixture')

      await fixture()

      log('Applied fixture')

      const iosDevices = await getIosDevices()
      const androidDevices = await getAndroidDevices()

      log('Copying database to devices')

      await Promise.all(
        iosDevices.map(
          async ({ udid }) =>
            await write(
              file(
                /**
                 * ⚠️ Ensure this path matches the location the application creates
                 * the database at.
                 *
                 * See `<projectRoot>/src/data/database/database.ts` for where
                 * the database is opened. For the default location, see OP SQLite
                 * documentation: https://ospfranco.notion.site/Configuration-6b8b9564afcc4ac6b6b377fe34475090#52a6cb4dd75542df8581e59f2804c063)
                 */
                `${await getIosAppDataContainer(udid, appId)}/Library/app.db`,
              ),
              file(databasePath),
            ),
        ),
      )

      await Promise.all(
        androidDevices.map(async (device) => {
          await spawn([
            'adb',
            '-s',
            device,
            'push',
            databasePath,
            '/data/local/tmp',
          ]).exited

          await spawn([
            'adb',
            '-s',
            device,
            'shell',
            /**
             * ⚠️ Ensure the path for the `cp` command's destination matches the
             * location the application creates the database at.
             *
             * See `<projectRoot>/src/data/database/database.ts` for where
             * the database is opened. For the default location, see OP SQLite
             * documentation: https://ospfranco.notion.site/Configuration-6b8b9564afcc4ac6b6b377fe34475090#52a6cb4dd75542df8581e59f2804c063)
             */
            `run-as ${appId} sh -c 'mkdir -p ./databases && cp /data/local/tmp/app.db ./databases/app.db'`,
          ]).exited
        }),
      )

      log('Copied database to devices')

      return Response.json({ message: 'OK' }, { status: 200 })
    } catch (error) {
      log(error)

      return Response.json(error, { status: 500 })
    }
  },
} satisfies Serve
