import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: '**/*.schema.ts',
  out: './database/migrations',
  dialect: 'sqlite',
  driver: 'expo',
  migrations: {
    prefix: 'timestamp',
  },
})
