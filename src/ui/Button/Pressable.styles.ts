import { PressableStateCallbackType } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

export default StyleSheet.create(({ color, radius, spacing }) => ({
  pressable: ({ pressed }: PressableStateCallbackType) => ({
    alignItems: 'center',
    borderRadius: radius.large,
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
          backgroundColor: color.background.inverse,
        },
      },
      {
        priority: 'high',
        action: 'neutral',
        styles: {
          backgroundColor: color.background.inverse,
        },
      },
      {
        priority: 'low',
        action: 'primary',
        styles: {
          backgroundColor: color.background.transparent,
        },
      },
      {
        priority: 'low',
        action: 'neutral',
        styles: {
          backgroundColor: color.background.transparent,
        },
      },
    ],
  }),
}))
