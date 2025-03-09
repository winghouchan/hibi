import { BottomSheetView } from '@gorhom/bottom-sheet'
import { ComponentProps } from 'react'
import { StyleSheet } from 'react-native-unistyles'
import MenuItem from './MenuItem'

type Props = ComponentProps<typeof BottomSheetView>

const styles = StyleSheet.create(({ colors, spacing }, { insets }) => ({
  view: {
    backgroundColor: colors.neutral[0].background,
    flex: 1,
    gap: spacing[2],
    paddingBottom: insets.bottom,
    paddingLeft: insets.left + spacing[4],
    paddingRight: insets.right + spacing[4],
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
