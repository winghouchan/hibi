import { PressableStateCallbackType } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

export default StyleSheet.create(({ colors, radius, spacing }) => ({
  pressable: ({ pressed }: PressableStateCallbackType) => ({
    alignItems: 'center',
    borderRadius: radius[16],
    paddingInline: spacing.normal,
    width: '100%',

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
        small: {
          paddingBlock: spacing.condensed,
        },
        medium: {
          paddingBlock: spacing.normal,
        },
        default: {
          paddingBlock: spacing.normal,
        },
      },
    },

    compoundVariants: [
      {
        priority: 'high',
        action: 'primary',
        styles: {
          backgroundColor: colors.background.inverse,
        },
      },
      {
        priority: 'high',
        action: 'neutral',
        styles: {
          backgroundColor: colors.background.inverse,
        },
      },
      {
        priority: 'low',
        action: 'primary',
        styles: {
          backgroundColor: colors.background.transparent,
        },
      },
      {
        priority: 'low',
        action: 'neutral',
        styles: {
          backgroundColor: colors.background.transparent,
        },
      },
    ],
  }),
}))
