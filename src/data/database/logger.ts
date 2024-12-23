import { Logger as DrizzleLogger } from 'drizzle-orm'
import { formatDialect, sqlite } from 'sql-formatter'
import { log } from '@/telemetry'

class Logger implements DrizzleLogger {
  logQuery(query: string, params: unknown[]): void {
    log.debug(
      'Query:\n\n',
      formatDialect(query, {
        dialect: sqlite,
        dataTypeCase: 'upper',
        functionCase: 'upper',
        identifierCase: 'lower',
        keywordCase: 'upper',
        params: params.map((param) => `${param}`),
      }),
    )
  }
}

export default new Logger()
