import ReactNative, { Pressable, SwitchProps, Text } from 'react-native'

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
      style={{ flexDirection: 'row', justifyContent: 'space-between' }}
      testID={testID && `${testID}.switch`}
    >
      <Text testID={testID && `${testID}.switch.label`}>{label}</Text>
      <ReactNative.Switch
        onValueChange={onValueChange}
        testID={testID && `${testID}.switch.input`}
        value={value}
        {...props}
      />
    </Pressable>
  )
}
