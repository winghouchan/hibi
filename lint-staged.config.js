const typeCheck = ['tsc --project tsconfig.json --noEmit']
const lint = (files) =>
  ['eslint --fix', 'prettier --write --ignore-unknown'].map(
    (command) => `${command} ${files.join(' ')}`,
  )
const test = ['jest --onlyChanged']

module.exports = {
  '**/!(*.{js,jsx,ts,tsx})': (files) => [...lint(files)],
  '*.{js,jsx}': (files) => [...lint(files), ...test],
  '*.{ts,tsx}': (files) => [...typeCheck, ...lint(files), ...test],
}
