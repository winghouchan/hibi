module.exports = {
  '**/!(*.{js,jsx,ts,tsx})': ['prettier --write --ignore-unknown'],
  '*.{js,jsx}': ['eslint --fix', 'prettier --write --ignore-unknown'],
  '*.{ts,tsx}': () => [
    'tsc --project tsconfig.json --noEmit',
    'eslint --fix',
    'prettier --write --ignore-unknown',
  ],
}
