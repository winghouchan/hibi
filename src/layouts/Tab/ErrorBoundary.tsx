import { PropsWithChildren } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { Fault } from '@/ui'

type Props = PropsWithChildren

const styles = StyleSheet.create(({ spacing }, { insets }) => ({
  fallback: {
    flex: 1,
    paddingTop: insets.top + spacing[4],
    paddingBottom: spacing[4],
    paddingLeft: insets.left + spacing[4],
    paddingRight: insets.right + spacing[4],
  },
}))

export default function ErrorBoundary({ children }: Props) {
  return (
    <Fault.Boundary
      fallbackRender={(props) => (
        <View style={styles.fallback}>
          <Fault.Fallback {...props} />
        </View>
      )}
    >
      {children}
    </Fault.Boundary>
  )
}
