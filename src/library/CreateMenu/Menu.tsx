import { BottomSheetView } from '@gorhom/bottom-sheet'
import { ComponentProps } from 'react'
import { StyleSheet } from 'react-native-unistyles'
import MenuItem from './MenuItem'

type Props = ComponentProps<typeof BottomSheetView>

const styles = StyleSheet.create(({ color, spacing }, { insets }) => ({
  view: {
    backgroundColor: color.background.default,
    flex: 1,
    gap: spacing.condensed,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left + spacing.spacious,
    paddingRight: insets.right + spacing.spacious,
  },
}))

function Menu({ children, style, ...props }: Props) {
  return (
    <BottomSheetView style={[styles.view, style]} {...props}>
      {children}
    </BottomSheetView>
  )
}

Menu.Item = MenuItem

export default Menu
