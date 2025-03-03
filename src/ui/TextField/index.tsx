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

const styles = StyleSheet.create(({ colors, fontWeights, spacing }) => ({
  view: {
    gap: spacing[2],
    width: '100%',
  },

  error: {
    color: colors.red[6],
    fontWeight: fontWeights[5],
  },

  input: {
    variants: {
      error: {
        true: {
          borderColor: colors.red[6],
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
