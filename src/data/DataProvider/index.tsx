import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import {
  DefaultError,
  QueryCache,
  QueryClient,
  QueryClientProvider,
  QueryClientProviderProps,
} from '@tanstack/react-query'
import { useState } from 'react'
import { Alert } from 'react-native'

interface DataProviderProps
  extends Pick<QueryClientProviderProps, 'children'> {}

export default function DataProvider({ children }: DataProviderProps) {
  const { i18n } = useLingui()
  const [client] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error: DefaultError & { title?: string }, query) => {
            Alert.alert(
              error.title ? error.title : i18n.t(msg`Something went wrong`),
              error.message,
              [
                {
                  text: i18n.t(msg`Try again`),
                  style: 'default',
                  isPreferred: true,
                  onPress: () => {
                    client.refetchQueries({ queryKey: query.queryKey })
                  },
                },
                {
                  text: i18n.t(msg`Cancel`),
                  style: 'cancel',
                },
              ],
            )

            console.error(error)
          },
        }),

        ...(process.env.NODE_ENV === 'test' && {
          defaultOptions: {
            queries: {
              /**
               * Setting `gcTime` to `Infinity` stops an error where Jest has to force
               * a worker to exit with one of the following messages:
               *
               * - "Jest did not exit one second after the test run completed."
               * - "A worker process has failed to exit gracefully and has been force
               *    exited. This is likely caused by tests leaking due to improper
               *    teardown."
               *
               * @see {@link https://tanstack.com/query/latest/docs/framework/react/guides/testing#set-gctime-to-infinity-with-jest}
               */
              gcTime: Infinity,

              /**
               * Disable query retries. Allows for the testing of query error states.
               *
               * @see {@link https://tanstack.com/query/latest/docs/framework/react/guides/testing#turn-off-retries}
               */
              retry: false,
            },
          },
        }),
      }),
  )

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
