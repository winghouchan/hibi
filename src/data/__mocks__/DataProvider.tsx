import { useEffect } from 'react'
import type { DataProviderProps } from '../DataProvider'

export default jest.fn(({ children, onReady }: DataProviderProps) => {
  useEffect(() => {
    onReady?.()
  }, [onReady])

  return <>{children}</>
})
