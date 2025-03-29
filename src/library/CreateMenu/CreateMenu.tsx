import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useLingui } from '@lingui/react/macro'
import { forwardRef, useImperativeHandle, useRef } from 'react'
import { LogBox } from 'react-native'
import { collection } from '@/collections/schema'
import { Text } from '@/ui'
import Menu from './Menu'
import Modal from './Modal'

type Ref = {
  close: BottomSheetModal['close']
  open: BottomSheetModal['present']
}
type Props = {
  collection?: (typeof collection.$inferSelect)['id']
}

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

export default forwardRef<Ref, Props>(function CreateMenu({ collection }, ref) {
  const { t: translate } = useLingui()
  const modalRef = useRef<BottomSheetModal>(null)

  const close = () => {
    modalRef.current?.close()
  }

  const open = () => {
    modalRef.current?.present()
  }

  const onMenuItemPress = () => {
    close()
  }

  useImperativeHandle(ref, () => ({
    close,
    open,
  }))

  return (
    <Modal ref={modalRef}>
      <Menu testID="library.create.menu">
        <Menu.Item
          href="/collections/new"
          icon="folder"
          onPress={onMenuItemPress}
          testID="create.collection.link"
        >
          <Text>{translate`Collection`}</Text>
        </Menu.Item>
        <Menu.Item
          href={{
            pathname: '/note/new',
            ...(typeof collection !== 'undefined' && {
              params: {
                collections: [collection],
              },
            }),
          }}
          icon="edit-3"
          onPress={onMenuItemPress}
          testID="create.note.link"
        >
          <Text>{translate`Note`}</Text>
        </Menu.Item>
      </Menu>
    </Modal>
  )
})
