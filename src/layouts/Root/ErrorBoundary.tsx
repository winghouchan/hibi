import { ComponentProps, PropsWithChildren, useEffect } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { Fault } from '@/ui'
import hideSplashScreen from './hideSplashScreen'

type Props = PropsWithChildren

const styles = StyleSheet.create(({ spacing }, { insets }) => ({
  fallback: {
    flex: 1,
    paddingTop: insets.top + spacing.normal,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left + spacing.normal,
    paddingRight: insets.right + spacing.normal,
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
