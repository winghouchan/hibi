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
          color: colors.primary[0].foreground,
        },
        medium: {
          color: colors.neutral.foreground,
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
          color: colors.secondary[0].foreground,
        },
      },
      {
        priority: 'medium',
        action: 'primary',
        styles: {
          color: colors.primary[1].foreground,
        },
      },
      {
        priority: 'medium',
        action: 'neutral',
        styles: {
          color: colors.secondary[0].foreground,
        },
      },
      {
        priority: 'medium',
        action: 'success',
        styles: {
          color: colors.success[1].foreground,
        },
      },
      {
        priority: 'medium',
        action: 'danger',
        styles: {
          color: colors.danger[0].background,
        },
      },
      {
        priority: 'low',
        action: 'primary',
        styles: {
          color: colors.primary[2].foreground,
        },
      },
      {
        priority: 'low',
        action: 'neutral',
        styles: {
          color: colors.secondary[0].foreground,
        },
      },
      {
        priority: 'low',
        action: 'success',
        styles: {
          color: colors.success[1].foreground,
        },
      },
      {
        priority: 'low',
        action: 'danger',
        styles: {
          color: colors.danger[1].foreground,
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
