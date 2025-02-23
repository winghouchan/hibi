import themes from '@/ui/themes'

export const StyleSheet = {
  create: jest.fn((stylesheet) =>
    typeof stylesheet === 'function' ? stylesheet(themes.light) : stylesheet,
  ),
}
