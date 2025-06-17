import { PropsWithChildren } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

const styles = StyleSheet.create(
  ({ borderWidth, color, spacing }, { insets }) => ({
    header: {
      alignItems: 'center',
      borderBottomColor: color.borders.default,
      borderBottomWidth: borderWidth.thin,
      flexDirection: 'row',
      gap: spacing.condensed,
      justifyContent: 'space-between',
      paddingTop: insets.top,
      paddingLeft: insets.left + spacing.normal,
      paddingRight: insets.right + spacing.normal,
      paddingBottom: spacing.normal,
    },

    item: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.condensed,
    },
  }),
)

function Header({ children }: PropsWithChildren) {
  return <View style={styles.header}>{children}</View>
}

function HeaderItem({ children }: PropsWithChildren) {
  return <View style={styles.item}>{children}</View>
}

Header.Item = HeaderItem

export default Header
