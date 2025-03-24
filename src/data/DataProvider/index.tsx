import { useReactQueryDevTools } from '@dev-plugins/react-query'
import {
  QueryClient,
  QueryClientProvider,
  QueryClientProviderProps,
} from '@tanstack/react-query'
import { useState } from 'react'

type DataProviderProps = Pick<QueryClientProviderProps, 'children'>

export default function DataProvider({ children }: DataProviderProps) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            ...(process.env.NODE_ENV === 'test' && {
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
            }),
          },
        },
      }),
  )

  useReactQueryDevTools(client)

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
