import { forwardRef, LegacyRef } from 'react'
import { Pressable, PressableProps, View } from 'react-native'

function Button(
  {
    accessibilityRole = 'button',

    children,

    /**
     * Do not set a default to `role` as it has precedence over `accessibilityRole`
     *
     * @see {@link https://reactnative.dev/docs/accessibility#role}
     */
    role,

    testID,

    ...props
  }: PressableProps,
  ref: LegacyRef<View>,
) {
  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      ref={ref}
      role={role}
      testID={testID && `${testID}.button`}
      {...props}
    >
      {children}
    </Pressable>
  )
}

export default forwardRef(Button)
