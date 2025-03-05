import { merge } from 'lodash'
import * as tokens from '../tokens'
import base from './base'

const colors = {
  neutral: {
    background: tokens.colors.white,
    foreground: tokens.colors.neutral[10],
    border: [tokens.colors.neutral[3], tokens.colors.neutral[5]],
  },
  primary: [
    {
      background: tokens.colors.blue[7],
      foreground: tokens.colors.neutral[1],
      shadow: tokens.colors.blue[9],
      border: tokens.colors.blue[9],
    },
    {
      background: tokens.colors.blue[0],
      foreground: tokens.colors.blue[9],
    },
    {
      foreground: tokens.colors.blue[8],
    },
  ],
  secondary: [
    {
      background: tokens.colors.neutral[1],
      foreground: tokens.colors.neutral[8],
      shadow: tokens.colors.neutral[3],
      border: tokens.colors.neutral[3],
    },
    {
      background: tokens.colors.neutral[1],
    },
    {
      background: tokens.colors.neutral[3],
      foreground: tokens.colors.neutral[1],
    },
  ],
  danger: [
    {
      background: tokens.colors.red[7],
      foreground: tokens.colors.neutral[1],
      border: tokens.colors.red[9],
      shadow: tokens.colors.red[9],
    },
    {
      background: tokens.colors.transparent,
      foreground: tokens.colors.red[7],
      border: tokens.colors.red[7],
      shadow: tokens.colors.red[7],
    },
    {
      background: tokens.colors.red[0],
    },
  ],
  success: [
    {
      background: tokens.colors.green[6],
      foreground: tokens.colors.neutral[1],
      shadow: tokens.colors.green[8],
      border: tokens.colors.green[8],
    },
    {
      background: tokens.colors.green[0],
      foreground: tokens.colors.green[8],
    },
  ],
} as const

const light = {
  colors,
} as const

export default merge(base, light)
