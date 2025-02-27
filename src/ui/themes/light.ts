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

const red = [
  chroma.oklch(0.971, 0.013, 17.38).hex(),
  chroma.oklch(0.936, 0.032, 17.717).hex(),
  chroma.oklch(0.885, 0.062, 18.334).hex(),
  chroma.oklch(0.808, 0.114, 19.571).hex(),
  chroma.oklch(0.704, 0.191, 22.216).hex(),
  chroma.oklch(0.637, 0.237, 25.331).hex(),
  chroma.oklch(0.577, 0.245, 27.325).hex(),
  chroma.oklch(0.505, 0.213, 27.518).hex(),
  chroma.oklch(0.444, 0.177, 26.899).hex(),
  chroma.oklch(0.396, 0.141, 25.723).hex(),
  chroma.oklch(0.258, 0.092, 26.042).hex(),
] as const

const green = [
  chroma.oklch(0.979, 0.021, 166.113).hex(),
  chroma.oklch(0.95, 0.052, 163.051).hex(),
  chroma.oklch(0.905, 0.093, 164.15).hex(),
  chroma.oklch(0.845, 0.143, 164.978).hex(),
  chroma.oklch(0.765, 0.177, 163.223).hex(),
  chroma.oklch(0.696, 0.17, 162.48).hex(),
  chroma.oklch(0.596, 0.145, 163.225).hex(),
  chroma.oklch(0.508, 0.118, 165.612).hex(),
  chroma.oklch(0.432, 0.095, 166.913).hex(),
  chroma.oklch(0.378, 0.077, 168.94).hex(),
  chroma.oklch(0.262, 0.051, 172.552).hex(),
] as const

const blue = [
  chroma.oklch(0.97, 0.014, 254.604).hex(),
  chroma.oklch(0.932, 0.032, 255.585).hex(),
  chroma.oklch(0.882, 0.059, 254.128).hex(),
  chroma.oklch(0.809, 0.105, 251.813).hex(),
  chroma.oklch(0.707, 0.165, 254.624).hex(),
  chroma.oklch(0.623, 0.214, 259.815).hex(),
  chroma.oklch(0.546, 0.245, 262.881).hex(),
  chroma.oklch(0.488, 0.243, 264.376).hex(),
  chroma.oklch(0.424, 0.199, 265.638).hex(),
  chroma.oklch(0.379, 0.146, 265.522).hex(),
  chroma.oklch(0.282, 0.091, 267.935).hex(),
] as const

const colors = {
  text: {
    /**
     * Light theme: text colour on light background.
     */
    default: neutral[10],
    inverse: neutral[1],
  },
  neutral,
  red,
  green,
  blue,
} as const

const light = {
  colors,
} as const

export default merge(base, light)
