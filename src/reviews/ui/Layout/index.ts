import Container from './Container'
import Footer from './Footer'
import Main from './Main'

type LayoutComponents = typeof Container & {
  Main: typeof Main
  Footer: typeof Footer
}

const Layout = Container as LayoutComponents

Layout.Main = Main
Layout.Footer = Footer

export default Layout
