import * as Haptics from 'expo-haptics'
import { forwardRef } from 'react'
import {
  Pressable as NativePressable,
  PressableProps,
  View,
} from 'react-native'
import { UnistylesVariants } from 'react-native-unistyles'
import styles from './Pressable.styles'

type Variants = UnistylesVariants<typeof styles>
type Ref = View
type Props = PressableProps & Variants

export default forwardRef<Ref, Props>(function Pressable(
  {
    accessibilityRole = 'button',

    action = 'primary',

    children,

    onPressIn,

    /**
     * Do not set a default to `role` as it has precedence over `accessibilityRole`
     *
     * @see {@link https://reactnative.dev/docs/accessibility#role}
     */
    role,

    size,

    style,

    priority = 'high',

    ...props
  },
  ref,
) {
  const handlePressIn: PressableProps['onPressIn'] = (event) => {
    onPressIn?.(event)

    if (priority === 'high') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
  }

  styles.useVariants({ action, priority, size })

  return (
    <NativePressable
      accessibilityRole={accessibilityRole}
      onPressIn={handlePressIn}
      ref={ref}
      role={role}
      style={(state) => [
        styles.pressable(state),
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}
    >
      {children}
    </NativePressable>
  )
})
