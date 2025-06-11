import { useLingui } from '@lingui/react/macro'
import { type FallbackProps } from 'react-error-boundary'
import { View, ViewProps } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import Button from '../Button'
import Text from '../Text'

type Props = FallbackProps & Pick<ViewProps, 'testID'>

const styles = StyleSheet.create(({ spacing }) => ({
  container: {
    flex: 1,
    gap: spacing.normal,
    justifyContent: 'space-between',
  },

  description: {
    gap: spacing.condensed,
  },
}))

export default function Fallback({ error, resetErrorBoundary, testID }: Props) {
  const { t: translate } = useLingui()

  return (
    <View style={styles.container} testID={testID && `${testID}.fault`}>
      <View style={styles.description}>
        <Text testID={testID && `${testID}.fault.heading`}>
          {error.title ?? translate`Something went wrong`}
        </Text>
        {error.message && <Text>{error.message}</Text>}
      </View>
      <Button
        onPress={() => resetErrorBoundary()}
        testID={testID && `${testID}.fault.cta`}
      >{translate`Try again`}</Button>
    </View>
  )
}
