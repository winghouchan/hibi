import {
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
} from '../../base/typography'

/**
 * Creates typographic styles
 *
 * @param {Object} styles
 * @param {number} styles.fontSize The font size
 * @param {number} styles.letterSpacing A multiplier of the font size used to calculate the final letter spacing
 * @param {number} styles.lineHeight A multiplier of the font size used to calculate the final line height
 */
function createTypeStyles<
  T extends { fontSize: number; letterSpacing?: number; lineHeight?: number },
>({ fontSize, letterSpacing, lineHeight, ...styles }: T): T {
  return {
    fontSize,
    letterSpacing:
      typeof letterSpacing === 'number' ? fontSize * letterSpacing : undefined,
    lineHeight:
      typeof lineHeight === 'number'
        ? Math.round(fontSize * lineHeight)
        : undefined,
    ...styles,
  } as T
}

export const text = {
  display: createTypeStyles({
    fontSize: fontSize[32],
    fontWeight: fontWeight.semiBold,
    letterSpacing: letterSpacing.negative,
    lineHeight: lineHeight.normal,
  }),
  heading: {
    large: createTypeStyles({
      fontSize: fontSize[24],
      fontWeight: fontWeight.semiBold,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.normal,
    }),
    medium: createTypeStyles({
      fontSize: fontSize[20],
      fontWeight: fontWeight.medium,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.normal,
    }),
  },
  subheading: createTypeStyles({
    fontSize: fontSize[18],
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.none,
    lineHeight: lineHeight.normal,
  }),
  body: createTypeStyles({
    fontSize: fontSize[16],
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.none,
    lineHeight: lineHeight.normal,
  }),
  label: {
    large: createTypeStyles({
      fontSize: fontSize[16],
      fontWeight: fontWeight.semiBold,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.condensed,
    }),
    medium: createTypeStyles({
      fontSize: fontSize[14],
      fontWeight: fontWeight.medium,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.condensed,
    }),
    small: createTypeStyles({
      fontSize: fontSize[12],
      fontWeight: fontWeight.medium,
      letterSpacing: letterSpacing.none,
      lineHeight: lineHeight.condensed,
    }),
  },
}
