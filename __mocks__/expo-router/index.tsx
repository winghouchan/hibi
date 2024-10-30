const ExpoRouter = jest.requireActual('expo-router')

export const SplashScreen = {
  hideAsync: jest.fn(),
  preventAutoHideAsync: jest.fn(),
}

export const Link = jest.fn((props) => <ExpoRouter.Link {...props} />)

export const Redirect = jest.fn((props) => <ExpoRouter.Redirect {...props} />)

export const Tabs = jest.fn((props) => <ExpoRouter.Tabs {...props} />)

export const router = ExpoRouter.router

export const useLocalSearchParams = jest.fn(ExpoRouter.useLocalSearchParams)

export const useNavigation = jest.fn(ExpoRouter.useNavigation)

export const useRouter = jest.fn(ExpoRouter.useRouter)
