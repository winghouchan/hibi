import { TextInput } from 'react-native'

export const RichText = jest.fn(({ editor, ...props }) => {
  const value = editor
    .getJSON()
    .content.map(({ content }: { content: { text?: string }[] }) =>
      content.map(({ text }) => text).join(''),
    )
    .join('\n')

  return <TextInput {...props} value={value} />
})

export const useEditorBridge = jest.fn(({ initialContent }) => ({
  getJSON: jest.fn().mockReturnValueOnce(initialContent),
}))

export const useEditorContent = jest.fn()

export const CodeBridge = {
  configureCSS: jest.fn(),
}

export const PlaceholderBridge = {
  configureExtension: jest.fn(),
}

export const TenTapStartKit = [CodeBridge, PlaceholderBridge]
