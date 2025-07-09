import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create(({ color, text }) => ({
  text: {
    color: color.foreground.default,

    variants: {
      size: {
        display: text.display,
        'heading.large': text.heading.large,
        'heading.medium': text.heading.medium,
        'heading.small': text.heading.small,
        body: text.body,
        'label.medium': text.label.medium,
        'label.small': text.label.small,
        default: text.body,
      },
    },
  },
}))

export default styles
