import { useSuspenseQuery } from '@tanstack/react-query'
import { useDeferredValue } from 'react'
import { activeCollectionQuery } from '@/home/operations'

export default function useActiveCollection() {
  const { data } = useSuspenseQuery(activeCollectionQuery)
  const collection = useDeferredValue(data)

  return collection
}
