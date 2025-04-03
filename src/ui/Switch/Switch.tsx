import * as Haptics from 'expo-haptics'
import { useState } from 'react'
import { Pressable, SwitchProps, View } from 'react-native'
import Text from '../Text'
import styles from './Switch.styles'

interface Props
  extends Pick<
    SwitchProps,
    'disabled' | 'onChange' | 'onValueChange' | 'testID' | 'value'
  > {
  label: string
}

export default function Switch({ label, onValueChange, testID, value }: Props) {
  const [pressed, setPressed] = useState(false)

  const handlePress = () => {
    onValueChange?.(!value)

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
  }

  const handleKnobPressIn = () => {
    setPressed(true)
  }

  const handleKnobPressOut = () => {
    setPressed(false)
  }

  styles.useVariants({ pressed, value })

  return (
    <Pressable
      accessibilityRole="switch"
      onPress={handlePress}
      style={styles.pressable}
      testID={testID && `${testID}.switch`}
    >
      <Text testID={testID && `${testID}.switch.label`}>{label}</Text>
      <Pressable
        accessibilityRole="switch"
        style={styles.track}
        onPress={handlePress}
        onPressIn={handleKnobPressIn}
        onPressOut={handleKnobPressOut}
        testID={testID && `${testID}.switch.track`}
      >
        <View style={styles.knob} testID={testID && `${testID}.switch.knob`} />
      </Pressable>
    </Pressable>
  )
}
