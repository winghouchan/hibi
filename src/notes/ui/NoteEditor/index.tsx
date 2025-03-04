import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useHeaderHeight } from '@react-navigation/elements'
import { type FormikConfig, useFormik } from 'formik'
import {
  ComponentProps,
  ComponentRef,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react'
import { Pressable, View } from 'react-native'
import { RichTextInput, Switch } from '@/ui'
import { createNote, getNote, updateNote } from '../../operations'
import CollectionPicker from './CollectionPicker'
import styles from './styles'

interface Ref {
  submit: () => void
}

interface Props {
  value?: Partial<Awaited<ReturnType<typeof getNote>>>
  onSubmit: <T>(
    ...args: T extends [{ id: number }]
      ? Parameters<typeof updateNote>
      : Parameters<typeof createNote>
  ) => void
  testID?: string
}

export default forwardRef<Ref, Props>(function NoteEditor(
  { value, onSubmit, testID },
  ref,
) {
  const headerHeight = useHeaderHeight()
  const { i18n } = useLingui()
  const richTextInputRefs = useRef<
    (ComponentRef<typeof RichTextInput> | null)[]
  >([])

  const initialValues = {
    id: value?.id ?? undefined,
    collections: value?.collections ?? [],
    fields: value?.fields ?? [[{ value: '' }], [{ value: '' }]],
    config: {
      reversible: value?.reversible ?? false,
      separable: value?.separable ?? false,
    },
  }

  const _onSubmit: FormikConfig<typeof initialValues>['onSubmit'] = (
    values,
  ) => {
    return onSubmit(values)
  }

  const { handleSubmit, setFieldValue, values } = useFormik({
    enableReinitialize: true,
    initialValues,
    onSubmit: _onSubmit,
  })

  /**
   * Handles changes from the editor
   *
   * This function needs to be memoized (using `useCallback`) otherwise it
   * causes an infinite re-render as it seems the reference to `setFieldValue`
   * is not stable.
   */
  const onChange = useCallback<
    Exclude<ComponentProps<typeof RichTextInput>['onChange'], undefined>
  >(
    (name: string, value) => {
      value?.content &&
        setFieldValue(
          name,
          value.content?.map(({ content }) => ({
            value: content?.[0].text ?? '',
          })),
        )
    },
    [setFieldValue],
  )

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
  }))

  return (
    <View style={styles.keyboardAvoidingView}>
      {values.fields.map((_, side) => (
        <RichTextInput
          autofocus={side === 0}
          initialContent={{
            type: 'doc',
            content: initialValues.fields[side].reduce<
              ComponentProps<typeof RichTextInput>['initialContent'][]
            >(
              (accumulator, field) =>
                // @todo: Handle other types of fields
                typeof field.value === 'string'
                  ? [
                      ...accumulator,
                      {
                        type: 'paragraph',
                        content: [{ type: 'text', text: field.value }],
                      },
                    ]
                  : accumulator,
              [],
            ),
          }}
          key={side}
          name={`fields.${side}`}
          onChange={onChange}
          placeholder={side === 0 ? i18n.t(msg`Front`) : i18n.t(msg`Back`)}
          ref={(ref) => {
            richTextInputRefs.current[side] = ref
          }}
          testID={testID && `${testID}.note-editor.side-${side}`}
        />
      ))}
      <Pressable
        accessible={false}
        accessibilityRole="button"
        onStartShouldSetResponderCapture={() => {
          richTextInputRefs.current?.forEach((ref) => ref?.blur())
          return false
        }}
        style={styles.settings}
      >
        <CollectionPicker
          onChange={(value) => {
            setFieldValue('collections', value)
          }}
          value={values.collections}
        />
        <Switch
          label={i18n.t(msg`Reversible`)}
          onValueChange={(value) => {
            setFieldValue('config.reversible', value)
          }}
          testID={testID && `${testID}.note-editor.reversible`}
          value={values.config.reversible}
        />
        <Switch
          label={i18n.t(msg`Separable`)}
          onValueChange={(value) => {
            setFieldValue('config.separable', value)
          }}
          testID={testID && `${testID}.note-editor.separable`}
          value={values.config.separable}
        />
      </Pressable>
    </View>
  )
})
