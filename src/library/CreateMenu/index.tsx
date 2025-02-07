import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet'
import { Trans } from '@lingui/macro'
import { forwardRef, useImperativeHandle, useRef } from 'react'
import { LogBox } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

/**
 * Ignore error logs for the following deprecated APIs. These are logged when
 * the menu is opened.
 *
 * @see {@link https://github.com/software-mansion/react-native-reanimated/issues/6997}
 */
LogBox.ignoreLogs([
  'findHostInstance_DEPRECATED is deprecated in StrictMode',
  'findNodeHandle is deprecated in StrictMode',
])

export default forwardRef<{
  open: BottomSheetModal['present']
}>(function CreateMenu(_, ref) {
  const safeAreaInsets = useSafeAreaInsets()
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)

  const open = () => {
    bottomSheetModalRef.current?.present()
  }

  useImperativeHandle(ref, () => ({
    open,
  }))

  return (
    <BottomSheetModal
      /**
       * Setting `accessibility` to `false` allows for the tapping of elements
       * within the bottom sheet by the testing framework.
       *
       * @see {@link https://maestro.mobile.dev/platform-support/react-native#interacting-with-nested-components-on-ios}
       */
      accessible={false}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} />
      )}
      enableDynamicSizing={false}
      ref={bottomSheetModalRef}
      snapPoints={['25%']}
    >
      <BottomSheetView
        testID="library.create.menu"
        style={{
          flex: 1,
          paddingBottom: safeAreaInsets.bottom,
          paddingLeft: safeAreaInsets.left,
          paddingRight: safeAreaInsets.right,
        }}
      >
        <Trans>Collection</Trans>
        <Trans>Note</Trans>
      </BottomSheetView>
    </BottomSheetModal>
  )
})
