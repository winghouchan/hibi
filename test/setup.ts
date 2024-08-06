import * as matchersModule from 'jest-extended'

const {
  /**
   * Variable not used. Destructuring this resolves the following error:
   *
   * > TypeError: expect.extend: `__esModule` is not a valid matcher. Must be a function, is "boolean"
   *
   * This occurs because Jest is running with ES Module support enabled while
   * `jest-extended` is exporting via CJS. A transpiler, such as Babel, may add
   * the `__esModule` value to the exported module. `__esModule` is not a valid
   * matcher. Destructuring it stops it being passed to `expect.extend` which
   * resolves the above error.
   */
  __esModule,

  /**
   * Variable not used. Destructuring this resolves the following error:
   *
   * > TypeError: expect.extend: `default` is not a valid matcher. Must be a function, is "object"
   *
   * This occurs because Jest is running with ES Module support enabled. `jest-extended`'s
   * default export is not a valid matcher. Destructuring it stops it being passed
   * to `expect.extend` which resolves the above error.
   */
  default: _,

  ...matchers
} = matchersModule

expect.extend(matchers)
