import ReactNative from 'react-native'
import style from './style'

export default function Text({
  style: _style,
  ...props
}: ReactNative.TextInputProps) {
  return <ReactNative.Text style={[style.text, _style]} {...props} />
}
