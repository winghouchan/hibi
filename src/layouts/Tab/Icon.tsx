import { withUnistyles } from 'react-native-unistyles'
import { Icon } from '@/ui'

const TabIcon = withUnistyles(Icon, ({ colors }) => ({
  color: colors.neutral[0].foreground,
}))

export default TabIcon
