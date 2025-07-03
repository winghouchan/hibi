import { useContext } from 'react'
import Context from './Context'

export default function useMenuContext() {
  const context = useContext(Context)

  if (!context) {
    throw new Error(
      'Menu context not defined. Is the component a child of a `<Menu>`?',
    )
  }

  return context
}
