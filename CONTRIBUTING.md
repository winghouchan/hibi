# Contributing to Hibi

## Setup

After cloning the project:

1. Ensure the language runtimes are consistent with the versions specified in [`.tool-versions`](./.tool-versions). If you use a runtime version manager like [asdf](https://asdf-vm.com) or [mise-en-place](https://mise.jdx.dev) they should automatically use the versions specified.

2. Install environment dependencies (see [`Brewfile`](./Brewfile)):

   ```bash
   brew bundle install
   ```

3. Install project dependencies (see [`package.json`](./package.json)):

   ```bash
   yarn install
   ```

4. Make sure your environment is set up for development with the [Expo](https://docs.expo.dev/) framework for [React Native](https://reactnative.dev) – see [documentation](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build&buildEnv=local). Dependencies should have been installed in the previous steps, however some extra configuration may be required.

5. Build the apps, see below.

## Building

### Android and iOS products

The table below shows the command to build each product in each environment:

|                    | Android                           | iOS                           |
| ------------------ | --------------------------------- | ----------------------------- |
| **Development**    | `yarn run:android`                | `yarn run:ios`                |
| **Test (Debug)**   | `yarn build:android:test`         | `yarn build:ios:test`         |
| **Test (Release)** | `yarn build:android:test:release` | `yarn build:ios:test:release` |
| **Production**     | 🚧                                | 🚧                            |

> [!IMPORTANT]
> The builds commands need to be run after any changes to native code or native dependencies.

Additionally, some important information about each environment:

|                                   | Development       | Test (Debug)                          | Test (Release)                        | Production    |
| --------------------------------- | ----------------- | ------------------------------------- | ------------------------------------- | ------------- |
| **Display Name**                  | Hibi (Dev)        | Hibi (Test)                           | Hibi (Test)                           | Hibi          |
| **Scheme(s)**                     | `co.hibi.app.dev` | `co.hibi.app.test`<br />`co.hibi.app` | `co.hibi.app.test`<br />`co.hibi.app` | `co.hibi.app` |
| **Variant / Configuration**       | Development Debug | Test Debug                            | Test Release                          | Release       |
| **JavaScript Bundle Server Port** | 8082              | 8081                                  | N/A                                   | N/A           |
| **Developer Tools**               | ✅                | ⚠️                                    | ❌                                    | ❌            |

The development environment is the environment to conduct development work. The development app can be identified on device with the display name "Hibi (Dev)". The apps are built using the "development debug" variant/configuration which allows the app to receive the JavaScript bundle from a local server and enables developer tooling such as the [Expo Dev Client](https://docs.expo.dev/versions/latest/sdk/dev-client/). The JavaScript bundle is served from port `8082` to allow the test app to use the default port (`8081`) as the app cannot be configured to request the bundle from a different port during end-to-end tests.

The test (debug) environment is the environment to work on end-to-end tests and run them locally. The test app can be identified on device with the display name "Hibi (Test)". It has also been configured to accept the production scheme so that end-to-end tests can open deep links. The apps are built using the "test debug" variant/configuration which is similar to development in that debug mode allows the app to receive the JavaScript bundle from a local server so that JavaScript changes don't necessitate a rebuild; however Expo Dev Client has been disabled so that the app performs more similarly to production.

The test (release) environment allows end-to-end tests to be run in an environment closest to production without being an actual production build. The apps are built using the "test release" variant/configuration which bundles the JavaScript in the app and disables developer tooling.

### Other products

#### Database migration files

User data is stored on device in an SQLite database. Database migration files can be created using the following command:

```bash
yarn build:database --name=<name>
```

> [!IMPORTANT]
> The database migration command needs to be run after any changes to the schema.

#### Localisation template and message files

The localisation template file identifies every message that requires localisation and serves as a template for creating localised message catalogs. The message files store localised messages. `yarn build:intl:extract-template` creates the localisation template file. `yarn build:intl:compile` creates TypeScript files containing the localised messages from the localised message catalogs. These commands don't need to be run locally however it's good to know they exist.

## Development

After the app(s) have been built and installed on a device/emulator/simulator, ensure the JavaScript bundle server is running. The server may be started after a build has been completed or by running `yarn start`.

## Testing

The table below shows the available commands for the different types of tests that can be run:

|                             | Command                                                                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Unit/Integration (Once)     | `yarn test`                                                                                                                         |
| Unit/Integration (Coverage) | `yarn test:coverage`                                                                                                                |
| Unit/Integration (Watch)    | `yarn test:watch`                                                                                                                   |
| End-to-end                  | `yarn test:end-to-end`<br />If testing using the test debug build, run `yarn start:test` in a separate terminal window/tab as well. |

Unit/integration tests are run using Jest ([documentation](https://jestjs.io/docs/getting-started)). End-to-end tests are run using Maestro ([documentation](https://docs.maestro.dev)).
