import {
  ComponentProps,
  ComponentRef,
  forwardRef,
  RefObject,
  useImperativeHandle,
  useRef,
} from 'react'
import { Text as NativeText, View as NativeView } from 'react-native'
import Pressable from './Pressable'
import Text from './Text'

type Ref = {
  pressable: RefObject<NativeView>
  text: RefObject<NativeText>
}
type Props = ComponentProps<typeof Pressable>

export default forwardRef<Ref, Props>(function Button(
  { action = 'primary', children, testID, priority = 'high', size, ...props },
  ref,
) {
  const pressableRef = useRef<ComponentRef<typeof Pressable>>(null)
  const textRef = useRef<ComponentRef<typeof Text>>(null)

  useImperativeHandle(ref, () => ({
    pressable: pressableRef,
    text: textRef,
  }))

  return (
    <Pressable
      action={action}
      ref={pressableRef}
      testID={testID && `${testID}.button`}
      priority={priority}
      size={size}
      {...props}
    >
      {(state) => (
        <Text
          action={action}
          numberOfLines={1}
          priority={priority}
          ref={textRef}
          size={size}
        >
          {typeof children === 'function' ? children(state) : children}
        </Text>
      )}
    </Pressable>
  )
})
