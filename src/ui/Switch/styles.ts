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
            backgroundColor: colors.neutral[2],
          },
          true: {
            backgroundColor: colors.green[6],
          },
        },
      },
    },
    knob: {
      backgroundColor: colors.neutral[0],
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
