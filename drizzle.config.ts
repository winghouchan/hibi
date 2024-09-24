import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './!(node_modules)/schema/!(index|*.d|*.test).ts',
  out: './data/database/migrations',
  dialect: 'sqlite',
  driver: 'expo',
  migrations: {
    prefix: 'timestamp',
  },
})
