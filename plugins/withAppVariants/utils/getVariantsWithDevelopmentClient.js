/**
 * @import { Variants } from '..'
 */

/**
 * Returns the name of variants with the development client enabled.
 *
 * All variants in debug mode are assumed to have the development client.
 *
 * @param {Variants} variants The variants configured in the app config.
 * @returns {string[]}
 */
function getVariantsWithDevelopmentClient(variants) {
  return Object.entries(variants).reduce(
    (accumulator, [variant, { developmentClient }]) =>
      developmentClient === true || developmentClient === undefined
        ? [
            ...accumulator,
            `${variant.slice(0, 1).toUpperCase()}${variant.slice(1)}-Debug`,
          ]
        : accumulator,
    ['Debug'],
  )
}

module.exports = getVariantsWithDevelopmentClient
