import {
  CodeBridge,
  TenTapStartKit as DefaultExtensions,
  PlaceholderBridge,
  RichText,
  useEditorBridge,
  useEditorContent,
} from '@10play/tentap-editor'
import { ComponentProps, useEffect } from 'react'
import { View } from 'react-native'

/**
 * Stops the web view over-scrolling
 *
 * On iOS there is a 'bounce' effect when attempting to scroll past the boundary
 * of a scroll area. This behaviour is unwanted for the editor web view. The web
 * view has a `bounces` prop to control this. However, there is a bug where setting
 * its value to `false` has no effect. Setting the `overscroll-behaviour` of the
 * `html` element in the web view works around the issue.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior | `overscroll-behavior` documentation}
 * @see {@link https://github.com/react-native-webview/react-native-webview/blob/master/docs/Reference.md#bounces | `bounces` documentation}
 * @see {@link https://github.com/react-native-webview/react-native-webview/issues/3555 | GitHub issue for bug with `bounces`}
 */
// eslint-disable-next-line lingui/no-unlocalized-strings
const stopWebViewOverScroll = `html { overscroll-behavior: none; }`

interface Content {
  type: string
  content?: Content[]
  text?: string
}

interface Props
  extends Pick<ComponentProps<typeof RichText>, 'testID'>,
    Pick<
      Exclude<Parameters<typeof useEditorBridge>[0], undefined>,
      'autofocus' | 'initialContent'
    > {
  name: string
  onChange?: (name: string, content?: Content) => void
  placeholder?: string
}

export default function Editor({
  autofocus,
  initialContent,
  name,
  onChange,
  placeholder,
  testID,
}: Props) {
  const editor = useEditorBridge({
    bridgeExtensions: [
      ...DefaultExtensions,
      CodeBridge.configureCSS(stopWebViewOverScroll),
      PlaceholderBridge.configureExtension({
        placeholder,
      }),
    ],
    autofocus,
    initialContent,
  })
  const content = useEditorContent(editor, { type: 'json' }) as Content

  useEffect(() => {
    onChange?.(name, content)
  }, [content, name, onChange])

  return (
    <View style={{ flex: 1 }} testID={testID && `${testID}.editor`}>
      <RichText editor={editor} testID={testID && `${testID}.editor.input`} />
    </View>
  )
}
