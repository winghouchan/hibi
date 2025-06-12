import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create((theme) => ({
  text: {
    color: theme.colors.neutral[0].foreground,

    variants: {
      size: {
        display: theme.text.display,
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
