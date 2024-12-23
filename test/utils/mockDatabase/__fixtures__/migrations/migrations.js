// This file is required for Expo/React Native SQLite migrations

import m0000 from './20240802000000_add-mock-table.sql'
import journal from './meta/_journal.json'

export default {
  journal,
  migrations: {
    m0000,
  },
}
