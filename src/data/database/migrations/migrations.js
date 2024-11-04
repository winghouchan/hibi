// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import m0000 from './20241104202250_base.sql'
import journal from './meta/_journal.json'

export default {
  journal,
  migrations: {
    m0000,
  },
}
