/* eslint-env node */

import path from 'path'
import { dangerReassure } from 'reassure'

/**
 * Prints the benchmarking report
 *
 * @see {@link https://github.com/callstack/reassure}
 */
dangerReassure({
  inputFilePath: path.join(__dirname, './.reassure/output.md'),
})
