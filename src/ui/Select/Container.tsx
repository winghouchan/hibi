import { PropsWithChildren } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { FullWindowOverlay } from 'react-native-screens'

export default function Container({ children }: PropsWithChildren) {
  return Platform.OS === 'ios' ? (
    <FullWindowOverlay>{children}</FullWindowOverlay>
  ) : (
    <View style={StyleSheet.absoluteFill}>{children}</View>
  )
}
