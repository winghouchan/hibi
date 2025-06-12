import {
  fontSizes,
  fontWeights,
  letterSpacings,
  lineHeights,
} from '../../tokens/typography'

/**
 * Creates typographic styles
 *
 * @param {Object} styles
 * @param {number} styles.fontSize The font size
 * @param {number} styles.lineHeight A multiplier of the font size used to calculate the final line height
 */
function createTypeStyles<T extends { fontSize: number; lineHeight?: number }>({
  fontSize,
  lineHeight,
  ...styles
}: T): T {
  return {
    fontSize,
    lineHeight:
      typeof lineHeight === 'number'
        ? Math.round(fontSize * lineHeight)
        : undefined,
    ...styles,
  } as T
}

export const text = {
  heading: createTypeStyles({
    fontSize: fontSizes[4],
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacings[0],
    lineHeight: lineHeights[1],
  }),
  subheading: createTypeStyles({
    fontSize: fontSizes[3],
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacings[0],
    lineHeight: lineHeights[1],
  }),
  body: createTypeStyles({
    fontSize: fontSizes[2],
    fontWeight: fontWeights.regular,
    letterSpacing: letterSpacings[0],
    lineHeight: lineHeights[1],
  }),
  label: {
    large: createTypeStyles({
      fontSize: fontSizes[2],
      fontWeight: fontWeights.semiBold,
      letterSpacing: letterSpacings[0],
      lineHeight: lineHeights[2],
    }),
    medium: createTypeStyles({
      fontSize: fontSizes[1],
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacings[0],
      lineHeight: lineHeights[2],
    }),
    small: createTypeStyles({
      fontSize: fontSizes[0],
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacings[0],
      lineHeight: lineHeights[2],
    }),
  },
}
