import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create(({ colors, radii, sizes, spacing }) => {
  const size = 28
  const inset = 2

  return {
    pressable: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing[2],
      justifyContent: 'space-between',
    },
    track: {
      borderRadius: radii[2],
      height: size + inset * 2,
      width: size * 2,

      variants: {
        value: {
          false: {
            backgroundColor: colors.neutral[1].background,
          },
          true: {
            backgroundColor: colors.success[0].background,
          },
        },
      },
    },
    knob: {
      backgroundColor: colors.neutral[1].foreground,
      borderRadius: radii[2],
      height: size,
      insetBlockStart: inset,
      position: 'absolute',

      variants: {
        pressed: {
          false: {
            width: size,
          },
          true: {
            width: size + 4,
          },
        },
        value: {
          false: {
            insetInlineStart: inset,
          },
          true: {
            insetInlineEnd: inset,
          },
        },
      },
    },
  }
})

export default styles
