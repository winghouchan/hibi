import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet'
import { Trans } from '@lingui/react/macro'
import { Link } from 'expo-router'
import { forwardRef, useImperativeHandle, useRef } from 'react'
import { LogBox } from 'react-native'
import styles from './styles'

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

function Backdrop(props: BottomSheetBackdropProps) {
  return <BottomSheetBackdrop {...props} disappearsOnIndex={-1} />
}

export default forwardRef<{
  close: BottomSheetModal['close']
  open: BottomSheetModal['present']
}>(function CreateMenu(_, ref) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)

  const close = () => {
    bottomSheetModalRef.current?.close()
  }

  const open = () => {
    bottomSheetModalRef.current?.present()
  }

  const onLinkPress = () => {
    close()
  }

  useImperativeHandle(ref, () => ({
    close,
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
      backdropComponent={Backdrop}
      enableDynamicSizing={false}
      ref={bottomSheetModalRef}
      snapPoints={['25%']}
    >
      <BottomSheetView testID="library.create.menu" style={styles.view}>
        <Link
          href="/collection/new"
          onPress={onLinkPress}
          testID="create.collection.link"
        >
          <Trans>Collection</Trans>
        </Link>
        <Link href="/note/new" onPress={onLinkPress} testID="create.note.link">
          <Trans>Note</Trans>
        </Link>
      </BottomSheetView>
    </BottomSheetModal>
  )
})
