import { DefaultLogger, LogWriter as DrizzleLogWriter } from 'drizzle-orm'
import { log } from '@/telemetry'

class LogWriter implements DrizzleLogWriter {
  write(message: string): void {
    log.debug(message)
  }
}

export default new DefaultLogger({ writer: new LogWriter() })
