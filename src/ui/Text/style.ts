import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create((theme) => ({
  text: {
    color: theme.colors.neutral.foreground,

    variants: {
      size: {
        heading: theme.text.heading,
        subheading: theme.text.subheading,
        body: theme.text.body,
        'label.medium': theme.text.label.medium,
        'label.small': theme.text.label.small,
        default: theme.text.body,
      },
    },
  },
}))

export default styles
