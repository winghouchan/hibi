import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { createContext, Dispatch, RefObject, SetStateAction } from 'react'

type Context = {
  bottomSheetModalRef: RefObject<BottomSheetModal>
  isOpen: boolean
  open: () => void
  close: () => void
  onChange: (value: any) => void
  selected: Set<any>
  setSelected: Dispatch<SetStateAction<Set<any>>>
  testID?: string
}

export default createContext<Context | null>(null)
