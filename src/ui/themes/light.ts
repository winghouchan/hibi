import chroma from 'chroma-js'
import { merge } from 'lodash'
import base from './base'

/**
 * Neutral greys
 */
const neutral = [
  chroma.oklch(0.985, 0.001, 106.423).hex(),
  chroma.oklch(0.97, 0.001, 106.424).hex(),
  chroma.oklch(0.923, 0.003, 48.717).hex(),
  chroma.oklch(0.869, 0.005, 56.366).hex(),
  chroma.oklch(0.709, 0.01, 56.259).hex(),
  chroma.oklch(0.553, 0.013, 58.071).hex(),
  chroma.oklch(0.444, 0.011, 73.639).hex(),
  chroma.oklch(0.374, 0.01, 67.558).hex(),
  chroma.oklch(0.268, 0.007, 34.298).hex(),
  chroma.oklch(0.216, 0.006, 56.043).hex(),
  chroma.oklch(0.147, 0.004, 49.25).hex(),
] as const

const colors = {
  text: {
    default: neutral[10],
  },
  neutral: neutral,
} as const

const light = {
  colors,
} as const

export default merge(base, light)
