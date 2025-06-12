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

  neutral: [
    {
      background: colors.neutral[1],
      foreground: colors.neutral[10],
      border: [colors.neutral[3], colors.neutral[5]],
    },
    {
      background: colors.neutral[0],
      foreground: colors.neutral[10],
    },
    {
      background: colors.neutral[2],
    },
  ],
  secondary: [
    {
      background: colors.neutral[1],
      foreground: colors.neutral[7],
      shadow: colors.neutral[3],
      border: colors.neutral[3],
    },
    {
      background: colors.neutral[0],
      foreground: colors.neutral[7],
      shadow: colors.neutral[3],
      border: colors.neutral[3],
    },
    {
      background: [colors.transparent, colors.neutral[2]],
      foreground: colors.neutral[8],
    },
  ],
  success: [
    {
      background: colors.green[6],
      foreground: colors.neutral[1],
      shadow: colors.green[8],
      border: colors.green[8],
    },
    {
      background: colors.neutral[0],
      foreground: colors.green[8],
      shadow: colors.green[8],
      border: colors.green[8],
    },
    {
      background: [colors.transparent, colors.green[0]],
      foreground: colors.green[8],
    },
  ],
} as const
