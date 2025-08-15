const joinCommandWithFiles = (files) => (command) =>
  `${command} ${files.join(' ')}`

const typeCheck = ['tsc --project tsconfig.json --noEmit']
const lintSource = (files) => ['eslint --fix'].map(joinCommandWithFiles(files))
const lintYaml = (files) => ['yamllint'].map(joinCommandWithFiles(files))
const prettier = (files) =>
  ['prettier --write --ignore-unknown'].map(joinCommandWithFiles(files))
const test = (files) =>
  ['jest --passWithNoTests --findRelatedTests'].map(joinCommandWithFiles(files))

module.exports = {
  '**/!(*.{js,jsx,ts,tsx})': (files) => [...prettier(files)],
  '*.{js,jsx}': (files) => [...lintSource(files), ...prettier(files)],
  '*.{ts,tsx}': (files) => [
    ...typeCheck,
    ...lintSource(files),
    ...prettier(files),
  ],
  '*.{js,jsx,ts,tsx}': (files) => [...test(files)],
  '*.{yaml,yml}': (files) => [...lintYaml(files)],
}
