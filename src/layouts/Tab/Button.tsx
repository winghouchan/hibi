import * as Haptics from 'expo-haptics'
import { TabTriggerSlotProps } from 'expo-router/ui'
import { ComponentProps, forwardRef } from 'react'
import { Pressable, PressableProps, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { Icon, Text } from '@/ui'

const styles = StyleSheet.create(
  ({ borderWidths, colors, radius, spacing }) => ({
    pressable: {
      alignItems: 'center',
      flex: 1,
    },

    container: {
      alignItems: 'center',
      flex: 1,
    },

    contentContainer: {
      alignItems: 'center',
      paddingTop: spacing.normal,
      gap: spacing.condensed,
    },

    focusIndicator: {
      borderRadius: radius[8],
      height: borderWidths.thick,
      width: '100%',

      variants: {
        isFocused: {
          false: {
            backgroundColor: 'transparent',
          },
          true: {
            backgroundColor: colors.foreground.default,
          },
        },
      },
    },
  }),
)

type Ref = View
type Props = TabTriggerSlotProps & {
  label: string
  icon: ComponentProps<typeof Icon>['name']
}

export default forwardRef<Ref, Props>(function TabTrigger(
  { children, icon, isFocused, label, onPressIn, style, ...props },
  ref,
) {
  const handlePressIn: PressableProps['onPressIn'] = (...args) => {
    onPressIn?.(...args)

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  styles.useVariants({ isFocused })

  return (
    <Pressable
      onPressIn={handlePressIn}
      ref={ref}
      style={(state) => [
        styles.pressable,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}
    >
      <View style={styles.container}>
        <View style={styles.focusIndicator} />
        <View style={styles.contentContainer}>
          <Icon name={icon} />
          <Text size="label.small">{label}</Text>
        </View>
      </View>
    </Pressable>
  )
})
