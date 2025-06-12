import chroma from 'chroma-js'

export const black = 'black'
export const white = 'white'
export const transparent = 'transparent'

/**
 * Neutral greys
 */
export const neutral = [
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

export const red = [
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
