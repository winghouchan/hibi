import { createNoteMutation, noteQuery, updateNoteMutation } from '@/notes'
import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import { FieldArray, Formik, type FormikConfig } from 'formik'
import { useEffect } from 'react'
import { Alert, Pressable, TextInput, View } from 'react-native'
import { onboardingCollectionQuery } from '../onboardingCollection'

export default function NoteEditor() {
  const { i18n } = useLingui()
  const { id: noteId } = useLocalSearchParams<{ id?: string }>()
  const queryClient = useQueryClient()
  const router = useRouter()
  const {
    data: collection,
    error: collectionError,
    isFetching: isFetchingCollection,
    refetch: refetchCollection,
  } = useQuery(onboardingCollectionQuery)
  const {
    data: note,
    error: noteError,
    isFetching: isFetchingNote,
    refetch: refetchNote,
  } = useQuery(noteQuery(Number(noteId)))
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

    try {
      await submit(values)
      queryClient.invalidateQueries({
        queryKey: onboardingCollectionQuery.queryKey,
      })
      router.back()
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (!isFetchingCollection && collectionError) {
      // @todo Handle error
      Alert.alert(
        i18n.t(msg`Something went wrong`),
        i18n.t(msg`There was a failure getting your onboarding collection`),
        [
          {
            text: i18n.t(msg`Try again`),
            style: 'default',
            isPreferred: true,
            onPress: () => {
              refetchCollection()
            },
          },
          {
            text: i18n.t(msg`Cancel`),
            style: 'cancel',
            onPress: () => {
              router.back()
            },
          },
        ],
      )
      console.error(collectionError)
    }

    if (!isFetchingNote && noteError) {
      // @todo Handle error
      Alert.alert(
        i18n.t(msg`Something went wrong`),
        i18n.t(msg`There was a failure getting the note`),
        [
          {
            text: i18n.t(msg`Try again`),
            style: 'default',
            isPreferred: true,
            onPress: () => {
              refetchNote()
            },
          },
          {
            text: i18n.t(msg`Cancel`),
            style: 'cancel',
            onPress: () => {
              router.back()
            },
          },
        ],
      )
      console.error(collectionError)
    }

    if (!isFetchingNote && note === null) {
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
  }, [
    collectionError,
    i18n,
    isFetchingCollection,
    isFetchingNote,
    note,
    noteError,
    refetchCollection,
    refetchNote,
    router,
  ])

  return collection && !isFetchingCollection ? (
    <View testID="onboarding.note-editor.screen">
      <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={onSubmit}
      >
        {({ handleChange, handleSubmit, values }) => (
          <>
            {values.fields.map((side, sideIndex) => (
              <FieldArray key={sideIndex} name={`fields.${sideIndex}`}>
                {({ push }) => (
                  <View>
                    <Trans>Side {sideIndex}</Trans>
                    <View>
                      {side.map((field, fieldIndex) => (
                        <TextInput
                          key={fieldIndex}
                          accessibilityLabel={i18n.t(
                            msg`Enter field data for side ${sideIndex + 1} field ${fieldIndex + 1}`,
                          )}
                          placeholder={i18n.t(
                            msg`Field data for field side ${sideIndex + 1} ${fieldIndex + 1}`,
                          )}
                          onChangeText={handleChange(
                            `fields.${sideIndex}.${fieldIndex}.value`,
                          )}
                          testID={`onboarding.note-editor.side-${sideIndex}.field-${fieldIndex}.input`}
                          value={field.value as string}
                        />
                      ))}
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        push({ value: '' })
                      }}
                    >
                      <Trans>Add field</Trans>
                    </Pressable>
                  </View>
                )}
              </FieldArray>
            ))}
            <Pressable
              accessibilityRole="button"
              onPress={() => handleSubmit()}
              testID="onboarding.note-editor.cta.button"
            >
              {values.id ? <Trans>Update note</Trans> : <Trans>Add note</Trans>}
            </Pressable>
          </>
        )}
      </Formik>
    </View>
  ) : !collection && !isFetchingCollection ? (
    <Redirect href="/" />
  ) : null
}
