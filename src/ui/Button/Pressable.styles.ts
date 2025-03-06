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
            backgroundColor: colors.primary[0].background,
            boxShadow: [
              {
                color: colors.primary[0].shadow,
                ...(pressed ? boxShadows[0] : boxShadows[1]),
              },
            ],
          },
        },
        {
          priority: 'high',
          action: 'neutral',
          styles: {
            backgroundColor: colors.secondary[0].background,
            boxShadow: [
              {
                color: colors.secondary[0].shadow,
                ...(pressed ? boxShadows[0] : boxShadows[1]),
              },
            ],
          },
        },
        {
          priority: 'high',
          action: 'success',
          styles: {
            backgroundColor: colors.success[0].background,
            boxShadow: [
              {
                color: colors.success[0].shadow,
                ...(pressed ? boxShadows[0] : boxShadows[1]),
              },
            ],
          },
        },
        {
          priority: 'high',
          action: 'danger',
          styles: {
            backgroundColor: colors.danger[0].background,
            boxShadow: [
              {
                color: colors.danger[0].shadow,
                ...(pressed ? boxShadows[0] : boxShadows[1]),
              },
            ],
          },
        },
        {
          priority: 'medium',
          action: 'primary',
          styles: {
            backgroundColor: colors.primary[1].background,
            borderColor: colors.primary[1].border,
            boxShadow: [
              {
                color: colors.primary[1].shadow,
                ...(pressed ? boxShadows[0] : boxShadows[1]),
              },
            ],
          },
        },
        {
          priority: 'medium',
          action: 'neutral',
          styles: {
            backgroundColor: colors.secondary[1].background,
            borderColor: colors.secondary[1].border,
            boxShadow: [
              {
                color: colors.secondary[1].shadow,
                ...(pressed ? boxShadows[0] : boxShadows[1]),
              },
            ],
          },
        },
        {
          priority: 'medium',
          action: 'success',
          styles: {
            backgroundColor: colors.success[1].background,
            borderColor: colors.success[1].border,
            boxShadow: [
              {
                color: colors.success[1].shadow,
                ...(pressed ? boxShadows[0] : boxShadows[1]),
              },
            ],
          },
        },
        {
          priority: 'medium',
          action: 'danger',
          styles: {
            backgroundColor: colors.danger[1].background,
            borderColor: colors.danger[1].border,
            boxShadow: [
              {
                color: colors.danger[1].shadow,
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
                backgroundColor: colors.primary[2].background[1],
              }
            : {
                backgroundColor: colors.primary[2].background[0],
              },
        },
        {
          priority: 'low',
          action: 'neutral',
          styles: pressed
            ? {
                backgroundColor: colors.secondary[2].background[1],
              }
            : {
                backgroundColor: colors.secondary[2].background[0],
              },
        },
        {
          priority: 'low',
          action: 'success',
          styles: pressed
            ? {
                backgroundColor: colors.success[2].background[1],
              }
            : {
                backgroundColor: colors.success[2].background[0],
              },
        },
        {
          priority: 'low',
          action: 'danger',
          styles: pressed
            ? {
                backgroundColor: colors.danger[2].background[1],
              }
            : {
                backgroundColor: colors.danger[2].background[0],
              },
        },
      ],
    }),
  }),
)
