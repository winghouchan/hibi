import * as colors from '../../tokens/colors'

export default {
  background: {
    default: colors.neutral[0],
    inverse: colors.neutral[10],
    muted: colors.neutral[1],
    transparent: colors.transparent,
  },

  foreground: {
    danger: colors.red[7],
    default: colors.neutral[10],
    inverse: colors.neutral[0],
    muted: colors.neutral[5],
  },

  borders: {
    danger: colors.red[7],
    default: colors.neutral[3],
    emphasis: colors.neutral[4],
  },
} as const
