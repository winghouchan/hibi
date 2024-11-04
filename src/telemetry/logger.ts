import { logger, mapConsoleTransport } from 'react-native-logs'

const config = {
  base: {
    printDate: false,
    printLevel: false,
  },

  development: {
    enabled: true,
    transport: mapConsoleTransport,
  },

  test: {
    enabled: false,
    transport: mapConsoleTransport,
  },

  production: {
    enabled: false,
  },
}

export default logger.createLogger({
  ...config.base,

  ...(process.env.NODE_ENV === 'development'
    ? config.development
    : process.env.NODE_ENV === 'test'
      ? config.test
      : config.production),
})
