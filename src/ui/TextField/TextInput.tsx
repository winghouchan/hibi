import { useState } from 'react'
import { TextInput as NativeTextInput, TextInputProps } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create(
  ({ borderWidths, colors, radii, spacing, text }) => ({
    input: {
      backgroundColor: colors.neutral[1].background,
      borderColor: colors.neutral[0].border[0],
      borderRadius: radii[4],
      borderWidth: borderWidths[2],
      color: colors.neutral[0].foreground,
      padding: spacing[4],
      width: '100%',

      ...text.body,

      variants: {
        focused: {
          true: {
            borderColor: colors.neutral[0].border[1],
          },
        },
      },
    },
  }),
)

export default function TextInput({
  onBlur,
  onFocus,
  style,
  testID,
  ...props
}: TextInputProps) {
  /**
   * Allows changes to variants to change the style
   *
   * @see {@link https://github.com/jpudysz/react-native-unistyles/issues/368}
   */
  // eslint-disable-next-line react-compiler/react-compiler
  'use no memo'

  const [focused, setFocused] = useState(false)

  const handleBlur: TextInputProps['onBlur'] = (...args) => {
    setFocused(false)
    onBlur?.(...args)
  }

  const handleFocus: TextInputProps['onFocus'] = (...args) => {
    setFocused(true)
    onFocus?.(...args)
  }

  styles.useVariants({ focused })

  return (
    <NativeTextInput
      onBlur={handleBlur}
      onFocus={handleFocus}
      style={[styles.input, style]}
      testID={testID && `${testID}.input`}
      {...props}
    />
  )
}
