import {
  type StackCardInterpolatedStyle,
  type StackCardInterpolationProps,
} from '@react-navigation/stack'
import { Animated } from 'react-native'

/**
 * Slides the screen from left-to-right when text direction is left-to-right and
 * right-to-left when text direction is right-to-left. The focused and unfocused
 * screens are translated the same amount (unlike the default which translates
 * the unfocused screen by a third of the screen width). Additionally, there are
 * no shadows applied. This means the newly focused screen appears to be pushing
 * the previous screen off as opposed to being stacked on top of it.
 */
export const forHorizontalSlide = ({
  current,
  next,
  inverted,
  layouts: { screen },
}: StackCardInterpolationProps): StackCardInterpolatedStyle => {
  const translateFocused = Animated.multiply(
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [screen.width, 0],
    }),
    inverted,
  )

  const translateUnfocused = next
    ? Animated.multiply(
        next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -screen.width],
        }),
        inverted,
      )
    : 0

  return {
    cardStyle: {
      transform: [
        { translateX: translateFocused },
        { translateX: translateUnfocused },
      ],
    },
  }
}
