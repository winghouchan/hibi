import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  type BottomSheetModalProps,
} from '@gorhom/bottom-sheet'
import { forwardRef } from 'react'
import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create(({ color, radius }) => ({
  background: {
    backgroundColor: color.background.default,
    borderRadius: radius.large,
  },

  handle: {
    backgroundColor: color.background.default,
    borderRadius: radius.large,
  },
}))

function Backdrop(props: BottomSheetBackdropProps) {
  return <BottomSheetBackdrop {...props} disappearsOnIndex={-1} />
}

export default forwardRef<BottomSheetModal, BottomSheetModalProps>(
  function Menu({ backgroundStyle, children, handleStyle, ...props }, ref) {
    return (
      <BottomSheetModal
        /**
         * Setting `accessibility` to `false` allows for the tapping of elements
         * within the bottom sheet by the testing framework.
         *
         * @see {@link https://maestro.mobile.dev/platform-support/react-native#interacting-with-nested-components-on-ios}
         */
        accessible={false}
        backdropComponent={Backdrop}
        backgroundStyle={[styles.background, backgroundStyle]}
        enableDynamicSizing={false}
        handleStyle={[styles.handle, handleStyle]}
        ref={ref}
        snapPoints={['25%']}
        {...props}
      >
        {children}
      </BottomSheetModal>
    )
  },
)
