import {
  Pressable,
  Switch as NativeSwitch,
  SwitchProps,
  Text,
} from 'react-native'
import styles from './styles'

interface Props extends SwitchProps {
  label: string
}

export default function Switch({
  label,
  onValueChange,
  testID,
  value,
  ...props
}: Props) {
  const handleLabelPress = () => {
    onValueChange?.(!value)
  }

  return (
    <Pressable
      accessibilityRole="switch"
      onPress={handleLabelPress}
      style={styles.pressable}
      testID={testID && `${testID}.switch`}
    >
      <Text testID={testID && `${testID}.switch.label`}>{label}</Text>
      <NativeSwitch
        onValueChange={onValueChange}
        testID={testID && `${testID}.switch.input`}
        value={value}
        {...props}
      />
    </Pressable>
  )
}
