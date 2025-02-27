import { forwardRef } from 'react'
import { Text as NativeText, TextProps } from 'react-native'
import { StyleSheet, UnistylesVariants } from 'react-native-unistyles'

type Ref = NativeText
type Props = TextProps & UnistylesVariants<typeof styles>

const styles = StyleSheet.create(({ colors, fontSizes, fontWeights }) => ({
  text: {
    textAlign: 'center',

    variants: {
      priority: {
        high: {
          color: colors.text.inverse,
        },
        medium: {
          color: colors.text.default,
        },
        low: {},
      },
      action: {
        primary: {},
        neutral: {},
        success: {},
        danger: {},
      },
      pressed: {
        true: {},
        false: {},
      },
      size: {
        small: {
          fontSize: fontSizes[1],
          fontWeight: fontWeights[5],
        },
        medium: {
          fontSize: fontSizes[2],
          fontWeight: fontWeights[5],
        },
        default: {
          fontSize: fontSizes[2],
          fontWeight: fontWeights[5],
        },
      },
    },

    compoundVariants: [
      {
        priority: 'high',
        action: 'neutral',
        styles: {
          color: colors.neutral[8],
        },
      },
      {
        priority: 'medium',
        action: 'primary',
        styles: {
          color: colors.blue[9],
        },
      },
      {
        priority: 'medium',
        action: 'neutral',
        styles: {
          color: colors.neutral[7],
        },
      },
      {
        priority: 'medium',
        action: 'success',
        styles: {
          color: colors.green[8],
        },
      },
      {
        priority: 'medium',
        action: 'danger',
        styles: {
          color: colors.red[7],
        },
      },
      {
        priority: 'low',
        action: 'primary',
        styles: {
          color: colors.blue[8],
        },
      },
      {
        priority: 'low',
        action: 'neutral',
        styles: {
          color: colors.neutral[8],
        },
      },
      {
        priority: 'low',
        action: 'success',
        styles: {
          color: colors.green[8],
        },
      },
      {
        priority: 'low',
        action: 'danger',
        styles: {
          color: colors.red[7],
        },
      },
    ],
  },
}))

export default forwardRef<Ref, Props>(function Text(
  { action = 'primary', pressed, priority = 'high', size, style, ...props },
  ref,
) {
  /**
   * Allows changes to variants to change the style
   *
   * @see {@link https://github.com/jpudysz/react-native-unistyles/issues/368}
   */
  // eslint-disable-next-line react-compiler/react-compiler
  'use no memo'

  styles.useVariants({ action, pressed, priority, size })

  return <NativeText ref={ref} style={[styles.text, style]} {...props} />
})
