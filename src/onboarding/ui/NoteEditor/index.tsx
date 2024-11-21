import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import { FieldArray, Formik, type FormikConfig } from 'formik'
import { useEffect } from 'react'
import { Alert, View } from 'react-native'
import { createNoteMutation, noteQuery, updateNoteMutation } from '@/notes'
import { log } from '@/telemetry'
import { Button, TextInput } from '@/ui'
import { onboardingCollectionQuery } from '../../operations'

export default function NoteEditor() {
  const { i18n } = useLingui()
  const { id: noteId } = useLocalSearchParams<{ id?: string }>()
  const queryClient = useQueryClient()
  const router = useRouter()
  const { data: collection, isFetching: isFetchingCollection } = useQuery(
    onboardingCollectionQuery,
  )
  const { data: note, isFetching: isFetchingNote } = useQuery(
    noteQuery(Number(noteId)),
  )
  const { mutateAsync: createNote } = useMutation(createNoteMutation)
  const { mutateAsync: updateNote } = useMutation(updateNoteMutation)

  const initialValues = {
    id: noteId,
    collections: collection?.id ? [collection.id] : [],
    fields: note ? note.fields : [[{ value: '' }], [{ value: '' }]],
    config: {
      reversible: note?.reversible || false,
      separable: note?.separable || false,
    },
  }

  const onSubmit: FormikConfig<typeof initialValues>['onSubmit'] = async (
    values,
  ) => {
    type SubmitFunction<
      Values extends
        | Parameters<typeof updateNote>[0]
        | Parameters<typeof createNote>[0],
    > = Values extends Parameters<typeof updateNote>[0]
      ? typeof updateNote
      : typeof createNote

    const doesNoteExist = values.id !== undefined

    const submit = (doesNoteExist ? updateNote : createNote) as SubmitFunction<
      typeof values
    >

    const handlers: Parameters<typeof submit>[1] = {
      async onSuccess() {
        await queryClient.invalidateQueries({
          queryKey: onboardingCollectionQuery.queryKey,
        })

        router.back()
      },
      onError(error) {
        // @todo Handle error
        Alert.alert(
          i18n.t(msg`Something went wrong`),
          doesNoteExist
            ? i18n.t(msg`There was an error updating the note`)
            : i18n.t(msg`There was an error creating the note`),
          [
            {
              text: i18n.t(msg`Try again`),
              style: 'default',
              isPreferred: true,
              onPress: async () => {
                await submit(values, handlers)
              },
            },
            {
              text: i18n.t(msg`Cancel`),
              style: 'cancel',
            },
          ],
        )
        log.error(error)
      },
    }

    try {
      await submit(values, handlers)
    } catch {
      // Errors handled by `submit`'s error handler
    }
  }

  useEffect(() => {
    if (collection && !isFetchingNote && note === null) {
      Alert.alert(i18n.t(msg`The note doesn't exist`), '', [
        {
          text: i18n.t(msg`OK`),
          style: 'default',
          onPress: () => {
            router.back()
          },
        },
      ])
    }
  }, [collection, i18n, isFetchingNote, note, router])

  return collection && !isFetchingCollection ? (
    <View testID="onboarding.note-editor.screen">
      <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={onSubmit}
      >
        {({ handleSubmit, values }) => (
          <>
            {values.fields.map((side, sideIndex) => (
              <FieldArray key={sideIndex} name={`fields.${sideIndex}`}>
                {({ push }) => (
                  <View>
                    <Trans>Side {sideIndex}</Trans>
                    <View>
                      {side.map((field, fieldIndex) => (
                        <TextInput
                          accessibilityLabel={i18n.t(
                            msg`Enter field data for side ${sideIndex + 1} field ${fieldIndex + 1}`,
                          )}
                          key={fieldIndex}
                          name={`fields.${sideIndex}.${fieldIndex}.value`}
                          placeholder={i18n.t(
                            msg`Field data for field side ${sideIndex + 1} ${fieldIndex + 1}`,
                          )}
                          testID={`onboarding.note-editor.side-${sideIndex}.field-${fieldIndex}`}
                          value={field.value as string}
                        />
                      ))}
                    </View>
                    <Button
                      onPress={() => {
                        push({ value: '' })
                      }}
                    >
                      <Trans>Add field</Trans>
                    </Button>
                  </View>
                )}
              </FieldArray>
            ))}
            <Button
              onPress={() => handleSubmit()}
              testID="onboarding.note-editor.cta"
            >
              {values.id ? <Trans>Update note</Trans> : <Trans>Add note</Trans>}
            </Button>
          </>
        )}
      </Formik>
    </View>
  ) : !collection && !isFetchingCollection ? (
    <Redirect href="/" />
  ) : null
}
