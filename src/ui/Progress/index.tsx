import { View } from 'react-native'
import style from './style'

interface Props {
  label?: string
  value: number
}

export default function Progress({ label, value }: Props) {
  return (
    <View
      accessibilityLabel={`${label ? `${label} ` : ''}${value}%`}
      accessibilityRole="progressbar"
      style={style.track}
    >
      <View style={style.indicator(value)} />
    </View>
  )
}
