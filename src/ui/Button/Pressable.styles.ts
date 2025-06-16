import { PressableStateCallbackType } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

export default StyleSheet.create(({ color, radius, spacing }) => ({
  pressable: ({ pressed }: PressableStateCallbackType) => ({
    alignItems: 'center',
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
          borderRadius: radius.medium,
          paddingBlock: spacing.condensed,
        },
        medium: {
          borderRadius: radius.large,
          paddingBlock: spacing.normal,
        },
        default: {
          borderRadius: radius.large,
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
