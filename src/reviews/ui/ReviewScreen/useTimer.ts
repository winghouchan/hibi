import { useEffect, useRef, useState } from 'react'

interface Options {
  start?: boolean
}

export default function useTimer(options?: Options) {
  const interval = useRef<ReturnType<typeof setInterval>>()
  const [duration, setDuration] = useState(0)

  const start = () => {
    interval.current = setInterval(() => {
      setDuration((state) => state + 1)
    }, 1)
  }

  const stop = () => {
    clearInterval(interval.current)
  }

  useEffect(() => {
    if (options?.start) {
      start()
    }

    return stop
  }, [options?.start])

  return {
    duration,
    start,
    stop,
  }
}
