import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create(({ colors, radii, spacing }) => {
  const size = 28
  const inset = 2

  return {
    pressable: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.condensed,
      justifyContent: 'space-between',
    },
    track: {
      borderRadius: radii[2],
      height: size + inset * 2,
      width: size * 2,

      variants: {
        value: {
          false: {
            backgroundColor: colors.borders.default,
          },
          true: {
            backgroundColor: colors.borders.emphasis,
          },
        },
      },
    },
    knob: {
      backgroundColor: colors.background.default,
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
