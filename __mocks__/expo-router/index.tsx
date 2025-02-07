const ExpoRouter = jest.requireActual('expo-router')

export const SplashScreen = {
  hideAsync: jest.fn(),
  preventAutoHideAsync: jest.fn(),
}

export const Link = jest.fn((props) => <ExpoRouter.Link {...props} />)

export const Redirect = jest.fn((props) => <ExpoRouter.Redirect {...props} />)

export const Stack = ExpoRouter.Stack

export const Tabs = ExpoRouter.Tabs

export const router = ExpoRouter.router

export const useFocusEffect = jest.fn(ExpoRouter.useFocusEffect)

export const useLocalSearchParams = jest.fn(ExpoRouter.useLocalSearchParams)

export const useNavigation = jest.fn(ExpoRouter.useNavigation)

export const usePathname = jest.fn(ExpoRouter.usePathname)

export const useRouter = jest.fn(ExpoRouter.useRouter)
