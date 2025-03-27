import * as Sentry from '@sentry/react-native'

type Options = Parameters<typeof Sentry.startSpan>[0]

export function withSpan<T extends (...args: any[]) => any>(
  { name, attributes, ...options }: Options,
  operation: T,
): T {
  return (async (...args: Parameters<T>) =>
    await Sentry.startSpan(
      {
        name,
        op: 'db',
        attributes: {
          'db.system.name': 'sqlite',
          ...attributes,
        },
        ...options,
      },
      () => operation(...args),
    )) as T
}
