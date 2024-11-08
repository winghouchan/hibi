const typeCheck = ['tsc --project tsconfig.json --noEmit']
const lint = ['eslint --fix', 'prettier --write --ignore-unknown']
const intl = ['yarn run intl:extract --clean', 'git add ./src/intl/messages']

module.exports = {
  '**/!(*.{js,jsx,ts,tsx})': [...lint],
  '*.{js,jsx}': [...lint, ...intl],
  '*.{ts,tsx}': () => [...typeCheck, ...lint, ...intl],
}
