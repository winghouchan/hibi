const typeCheck = ['tsc --project tsconfig.json --noEmit']
const lint = (files) =>
  ['eslint --fix', 'prettier --write --ignore-unknown'].map(
    (command) => `${command} ${files.join(' ')}`,
  )
const intl = (files) => [
  `yarn run intl:extract --clean ${files.join(' ')}`,
  'git add ./src/intl/messages',
]

module.exports = {
  '**/!(*.{js,jsx,ts,tsx})': (files) => [...lint(files)],
  '*.{js,jsx}': (files) => [...lint(files), ...intl(files)],
  '*.{ts,tsx}': (files) => [...typeCheck, ...lint(files), ...intl(files)],
}
