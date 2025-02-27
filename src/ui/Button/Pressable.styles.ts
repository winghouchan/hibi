import { PressableStateCallbackType } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

export default StyleSheet.create(
  ({ borderWidths, boxShadows, colors, radii, spacing }) => ({
    pressable: ({ pressed }: PressableStateCallbackType) => ({
      alignItems: 'center',
      borderRadius: radii[4],
      width: '100%',

      variants: {
        priority: {
          high: {
            transform: [{ translateY: pressed ? boxShadows[1].offsetY : 0 }],
          },
          medium: {
            borderWidth: borderWidths[2],
            transform: [{ translateY: pressed ? boxShadows[1].offsetY : 0 }],
          },
          low: {},
        },
        action: {
          primary: {},
          neutral: {},
          success: {},
          danger: {},
        },
        size: {
          small: {
            paddingBlock: spacing[3],
            paddingInline: spacing[5],
          },
          medium: {
            paddingBlock: spacing[4],
            paddingInline: spacing[7],
          },
          default: {
            paddingBlock: spacing[4],
            paddingInline: spacing[7],
          },
        },
      },

      compoundVariants: [
        {
          priority: 'high',
          action: 'primary',
          styles: {
            backgroundColor: colors.blue[7],
            boxShadow: [
              {
                color: colors.blue[9],
                ...(pressed ? boxShadows[0] : boxShadows[1]),
              },
            ],
          },
        },
        {
          priority: 'high',
          action: 'neutral',
          styles: {
            backgroundColor: colors.neutral[1],
            boxShadow: [
              {
                color: colors.neutral[3],
                ...(pressed ? boxShadows[0] : boxShadows[1]),
              },
            ],
          },
        },
        {
          priority: 'high',
          action: 'success',
          styles: {
            backgroundColor: colors.green[6],
            boxShadow: [
              {
                color: colors.green[8],
                ...(pressed ? boxShadows[0] : boxShadows[1]),
              },
            ],
          },
        },
        {
          priority: 'high',
          action: 'danger',
          styles: {
            backgroundColor: colors.red[7],
            boxShadow: [
              {
                color: colors.red[9],
                ...(pressed ? boxShadows[0] : boxShadows[1]),
              },
            ],
          },
        },
        {
          priority: 'medium',
          action: 'primary',
          styles: {
            backgroundColor: pressed ? colors.blue[1] : colors.neutral[0],
            borderColor: colors.blue[9],
            boxShadow: [
              {
                color: colors.blue[9],
                ...(pressed ? boxShadows[0] : boxShadows[1]),
              },
            ],
          },
        },
        {
          priority: 'medium',
          action: 'neutral',
          styles: {
            backgroundColor: pressed ? colors.neutral[1] : colors.neutral[0],
            borderColor: colors.neutral[3],
            boxShadow: [
              {
                color: colors.neutral[3],
                ...(pressed ? boxShadows[0] : boxShadows[1]),
              },
            ],
          },
        },
        {
          priority: 'medium',
          action: 'success',
          styles: {
            backgroundColor: pressed ? colors.green[1] : colors.neutral[0],
            borderColor: colors.green[8],
            boxShadow: [
              {
                color: colors.green[8],
                ...(pressed ? boxShadows[0] : boxShadows[1]),
              },
            ],
          },
        },
        {
          priority: 'medium',
          action: 'danger',
          styles: {
            backgroundColor: pressed ? colors.red[1] : colors.neutral[0],
            borderColor: colors.red[7],
            boxShadow: [
              {
                color: colors.red[7],
                ...(pressed ? boxShadows[0] : boxShadows[1]),
              },
            ],
          },
        },
        {
          priority: 'low',
          action: 'primary',
          styles: pressed
            ? {
                backgroundColor: colors.blue[0],
                color: colors.text.inverse,
              }
            : {},
        },
        {
          priority: 'low',
          action: 'neutral',
          styles: pressed
            ? {
                backgroundColor: colors.neutral[0],
              }
            : {},
        },
        {
          priority: 'low',
          action: 'success',
          styles: pressed
            ? {
                backgroundColor: colors.green[0],
              }
            : {},
        },
        {
          priority: 'low',
          action: 'danger',
          styles: pressed
            ? {
                backgroundColor: colors.red[0],
              }
            : {},
        },
      ],
    }),
  }),
)
