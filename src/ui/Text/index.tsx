import { Text as NativeText, TextInputProps } from 'react-native'
import style from './style'

export default function Text({ style: _style, ...props }: TextInputProps) {
  return <NativeText style={[style.text, _style]} {...props} />
}
