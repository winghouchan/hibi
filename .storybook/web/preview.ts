/**
 * The Storybook preview configuration lives in the `preview` folder. It allows
 * for the organisation of things abstracted into separate files (for example:
 * the container decorator).
 *
 * However, this file is needed because the Storybook build script will remove
 * the import from `storybook.requires.ts` if it doesn't exist. As a result, the
 * preview `index` file is exported from here.
 */
export { default as default } from '../shared/preview/index'
