import { forwardRef } from 'react'
import { Text as NativeText, TextProps } from 'react-native'
import { StyleSheet, UnistylesVariants } from 'react-native-unistyles'

type Ref = NativeText
type Props = TextProps & UnistylesVariants<typeof styles>

const styles = StyleSheet.create(({ colors, text }) => ({
  text: {
    textAlign: 'center',

    variants: {
      priority: {
        high: {},
        low: {},
      },
      action: {
        primary: {},
        neutral: {},
      },
      size: {
        small: text.label.medium,
        medium: text.label.large,
        default: text.label.large,
      },
    },

    compoundVariants: [
      {
        priority: 'high',
        action: 'primary',
        styles: {
          color: colors.foreground.inverse,
        },
      },
      {
        priority: 'high',
        action: 'neutral',
        styles: {
          color: colors.foreground.inverse,
        },
      },
      {
        priority: 'low',
        action: 'primary',
        styles: {
          color: colors.foreground.default,
        },
      },
      {
        priority: 'low',
        action: 'neutral',
        styles: {
          color: colors.foreground.default,
        },
      },
    ],
  },
}))

export default forwardRef<Ref, Props>(function Text(
  { action = 'primary', priority = 'high', size, style, ...props },
  ref,
) {
  styles.useVariants({ action, priority, size })

  return <NativeText ref={ref} style={[styles.text, style]} {...props} />
})
