import { useState } from 'react'
import { TextInput as NativeTextInput, TextInputProps } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create(
  ({ borderWidths, colors, radii, spacing, text }) => ({
    input: {
      backgroundColor: colors.background.default,
      borderColor: colors.borders.default,
      borderRadius: radii[4],
      borderWidth: borderWidths.thin,
      color: colors.foreground.default,
      padding: spacing.normal,
      width: '100%',

      ...text.body,

      variants: {
        focused: {
          true: {
            borderColor: colors.borders.emphasis,
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
