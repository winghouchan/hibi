import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: '**/!(__fixtures__)/*.schema.ts',
  out: './database/migrations',
  dialect: 'sqlite',
  driver: 'expo',
  migrations: {
    prefix: 'timestamp',
  },
})
