import { Text as NativeText, TextProps } from 'react-native'
import { UnistylesVariants } from 'react-native-unistyles'
import styles from './style'

type Props = TextProps & UnistylesVariants<typeof styles>

export default function Text({ size, style, ...props }: Props) {
  /**
   * Allows changes to variants to change the style
   *
   * @see {@link https://github.com/jpudysz/react-native-unistyles/issues/368}
   */
  // eslint-disable-next-line react-compiler/react-compiler
  'use no memo'

  styles.useVariants({ size })

  return <NativeText style={[styles.text, style]} {...props} />
}
