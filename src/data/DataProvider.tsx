import {
  QueryClient,
  QueryClientProvider,
  QueryClientProviderProps,
} from '@tanstack/react-query'

const client = new QueryClient()

interface DataProviderProps
  extends Pick<QueryClientProviderProps, 'children'> {}

export default function DataProvider({ children }: DataProviderProps) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
