import messages from './messages'

const supportedLocales = Object.keys(messages)

export type SupportedLocale = keyof typeof messages
export default supportedLocales
