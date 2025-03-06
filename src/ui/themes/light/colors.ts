import * as colors from '../../tokens/colors'

export default {
  neutral: [
    {
      background: colors.white,
      foreground: colors.neutral[10],
      border: [colors.neutral[3], colors.neutral[5]],
    },
    {
      background: colors.neutral[2],
      foreground: colors.neutral[0],
    },
  ],
  primary: [
    {
      background: colors.blue[7],
      foreground: colors.neutral[0],
      shadow: colors.blue[9],
      border: colors.blue[9],
    },
    {
      background: colors.transparent,
      foreground: colors.blue[9],
      shadow: colors.blue[9],
      border: colors.blue[9],
    },
    {
      background: [colors.transparent, colors.blue[0]],
      foreground: colors.blue[8],
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
      background: colors.transparent,
      foreground: colors.neutral[7],
      shadow: colors.neutral[3],
      border: colors.neutral[3],
    },
    {
      background: [colors.transparent, colors.neutral[2]],
      foreground: colors.neutral[8],
    },
  ],
  danger: [
    {
      background: colors.red[7],
      foreground: colors.neutral[1],
      border: colors.red[9],
      shadow: colors.red[9],
    },
    {
      background: colors.transparent,
      foreground: colors.red[7],
      border: colors.red[7],
      shadow: colors.red[7],
    },
    {
      background: [colors.transparent, colors.red[0]],
      foreground: colors.red[7],
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
      background: colors.transparent,
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
