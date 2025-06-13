import { useState } from 'react'
import { TextInput as NativeTextInput, TextInputProps } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create(
  ({ borderWidth, color, radius, spacing, text }) => ({
    input: {
      backgroundColor: color.background.default,
      borderColor: color.borders.default,
      borderRadius: radius.large,
      borderWidth: borderWidth.thin,
      color: color.foreground.default,
      padding: spacing.normal,
      width: '100%',

      ...text.body,

      variants: {
        focused: {
          true: {
            borderColor: color.borders.emphasis,
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
