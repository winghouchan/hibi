import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './!(node_modules)/schema/!(index|*.d).ts',
  out: './database/migrations',
  dialect: 'sqlite',
  driver: 'expo',
  migrations: {
    prefix: 'timestamp',
  },
})
