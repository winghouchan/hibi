const joinCommandWithFiles = (files) => (command) =>
  `${command} ${files.join(' ')}`

const typeCheck = ['tsc --project tsconfig.json --noEmit']
const lint = (files) => ['eslint --fix'].map(joinCommandWithFiles(files))
const prettier = (files) =>
  ['prettier --write --ignore-unknown'].map(joinCommandWithFiles(files))
const test = ['jest --onlyChanged']

module.exports = {
  '**/!(*.{js,jsx,ts,tsx})': (files) => [...prettier(files)],
  '*.{js,jsx}': (files) => [...lint(files), ...prettier(files), ...test],
  '*.{ts,tsx}': (files) => [
    ...typeCheck,
    ...lint(files),
    ...prettier(files),
    ...test,
  ],
}
