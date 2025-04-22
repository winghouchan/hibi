import { ComponentProps, PropsWithChildren, useEffect } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { Fault } from '@/ui'
import hideSplashScreen from './hideSplashScreen'

type Props = PropsWithChildren

const styles = StyleSheet.create(({ spacing }, { insets }) => ({
  fallback: {
    flex: 1,
    paddingTop: insets.top + spacing[4],
    paddingBottom: insets.bottom,
    paddingLeft: insets.left + spacing[4],
    paddingRight: insets.right + spacing[4],
  },
}))

function Fallback(props: ComponentProps<typeof Fault.Fallback>) {
  useEffect(() => {
    hideSplashScreen()
  }, [])

  return (
    <View style={styles.fallback}>
      <Fault.Fallback {...props} />
    </View>
  )
}

export default function ErrorBoundary({ children }: Props) {
  return (
    <Fault.Boundary FallbackComponent={Fallback}>{children}</Fault.Boundary>
  )
}
