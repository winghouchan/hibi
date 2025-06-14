import { ComponentProps } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import Text from '../Text'
import TextInput from './TextInput'

type Props = ComponentProps<typeof TextInput> & {
  error?: string
  hint?: string
  label?: string
}

const styles = StyleSheet.create(({ color, spacing, text }) => ({
  view: {
    gap: spacing.condensed,
    width: '100%',
  },

  error: {
    color: color.foreground.danger,
    ...text.label.medium,
  },

  input: {
    variants: {
      error: {
        true: {
          borderColor: color.borders.danger,
        },
      },
    },
  },
}))

export default function TextField({ error, hint, label, ...props }: Props) {
  styles.useVariants({
    error: Boolean(error),
  })

  return (
    <View style={styles.view}>
      <TextInput style={styles.input} {...props} />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}
