import { View } from 'react-native'
import styles from './Progress.styles'

interface Props {
  label?: string
  value: number
}

export default function Progress({ label, value }: Props) {
  return (
    <View
      accessible={true}
      accessibilityLabel={`${label ? `${label} ` : ''}${value}%`}
      accessibilityRole="progressbar"
      style={styles.track}
    >
      <View style={styles.indicator(value)} />
    </View>
  )
}
