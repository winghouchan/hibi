import type { JestConfigWithTsJest } from 'ts-jest'

const config: JestConfigWithTsJest = {
  preset: 'jest-expo',
  clearMocks: true,
  moduleDirectories: ['node_modules', '<rootDir>'],
  setupFilesAfterEnv: ['./test/setup.ts'],
  testPathIgnorePatterns: ['e2e'],
}

export default config
