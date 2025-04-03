import { Text as NativeText, TextProps } from 'react-native'
import { UnistylesVariants } from 'react-native-unistyles'
import styles from './Text.styles'

type Props = TextProps & UnistylesVariants<typeof styles>

export default function Text({ size, style, ...props }: Props) {
  styles.useVariants({ size })

  return <NativeText style={[styles.text, style]} {...props} />
}
