import { useState } from 'react'
import ReactNative, { TextInputProps } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create(
  ({ borderWidths, colors, fontSizes, radii, spacing }) => ({
    input: {
      borderColor: colors.neutral[4],
      borderRadius: radii[4],
      borderWidth: borderWidths[2],
      fontSize: fontSizes[2],
      padding: spacing[4],
      width: '100%',

      variants: {
        focused: {
          true: {
            borderColor: colors.neutral[6],
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
    <ReactNative.TextInput
      onBlur={handleBlur}
      onFocus={handleFocus}
      style={[styles.input, style]}
      testID={testID && `${testID}.input`}
      {...props}
    />
  )
}
