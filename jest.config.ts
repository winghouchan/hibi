import type { JestConfigWithTsJest } from 'ts-jest'

const config: JestConfigWithTsJest = {
  preset: 'jest-expo',

  /**
   * The configuration for `extensionsToTreatAsEsm`, `moduleNameMapper` and
   * `transform` enables ESM support.
   *
   * @see {@link https://kulshekhar.github.io/ts-jest/docs/guides/esm-support/ | ts-jest Documentation}
   */
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  setupFilesAfterEnv: ['./test/setup.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        babelConfig: true,
        useESM: true,
      },
    ],
  },
}

export default config
