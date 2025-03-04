import themes from '@/ui/themes'

const runtimeMock = {
  insets: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
}

export const StyleSheet = {
  create: jest.fn((stylesheet) => ({
    ...(typeof stylesheet === 'function'
      ? stylesheet(themes.light, runtimeMock)
      : stylesheet),
    useVariants: jest.fn(),
  })),

  hairlineWidth: 1,
}

export const withUnistyles = jest.fn(
  (Component, mappings) =>
    function ComponentWithUnistyles(props?: object) {
      return <Component {...mappings?.()} {...(props ?? {})} />
    },
)
