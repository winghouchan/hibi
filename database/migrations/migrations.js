// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import m0000 from './20240807174217_store-collections.sql'
import m0001 from './20240808145309_store-notes.sql'
import m0002 from './20240809175129_store-reviewables.sql'
import m0003 from './20240817133426_store-reviews.sql'
import journal from './meta/_journal.json'

export default {
  journal,
  migrations: {
    m0000,
    m0001,
    m0002,
    m0003,
  },
}
