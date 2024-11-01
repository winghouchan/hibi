import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './!(node_modules)/**/schema/!(index|*.d|*.test).ts',
  out: './src/data/database/migrations',
  casing: 'snake_case',
  dialect: 'sqlite',
  driver: 'expo',
  migrations: {
    prefix: 'timestamp',
  },
})
