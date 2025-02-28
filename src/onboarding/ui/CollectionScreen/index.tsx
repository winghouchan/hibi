import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Alert } from 'react-native'
import { object, string } from 'yup'
import { Button, TextField } from '@/ui'
import { onboardingCollectionQuery } from '../../operations'
import Layout from '../Layout'
import useForm from './useForm'

export default function CollectionScreen() {
  const { i18n } = useLingui()
  const { data: collection } = useQuery(onboardingCollectionQuery)

  const onSubmitSuccess: Parameters<
    typeof useForm
  >[0]['onSubmitSuccess'] = () => {
    router.push('/onboarding/notes')
  }

  const onSubmitError: Parameters<typeof useForm>[0]['onSubmitError'] = (
    error,
    retry,
  ) => {
    Alert.alert(
      i18n.t(msg`Something went wrong`),
      typeof collection?.id === 'undefined'
        ? i18n.t(msg`There was an error creating the collection`)
        : i18n.t(msg`There was an error updating the collection`),
      [
        {
          text: i18n.t(msg`Try again`),
          style: 'default',
          isPreferred: true,
          onPress: retry,
        },
        {
          text: i18n.t(msg`Cancel`),
          style: 'cancel',
        },
      ],
    )
  }

  const validationSchema = object({
    name: string().required(i18n.t(msg`Your collection needs a name`)),
  })

  const { errors, handleChange, handleSubmit, isSubmitting, values } = useForm({
    initialValues: {
      id: collection?.id,
      name: collection?.name ?? '',
    },
    onSubmitSuccess,
    onSubmitError,
    validationSchema,
  })

  return (
    <Layout testID="onboarding.collection.screen">
      <Layout.Main>
        <Trans>What are you learning?</Trans>
        <TextField
          accessibilityLabel={i18n.t(msg`Enter a collection name`)}
          autoFocus
          error={errors.name}
          onChangeText={(value) => handleChange('name')(value)}
          onSubmitEditing={() => handleSubmit()}
          placeholder={i18n.t(msg`Collection name`)}
          testID="onboarding.collection.name"
          value={values.name}
        />
      </Layout.Main>
      <Layout.Footer>
        <Button
          testID="onboarding.collection.cta"
          onPress={() => handleSubmit()}
        >
          {isSubmitting ? (
            <Trans component={null}>Submitting</Trans>
          ) : values.id ? (
            <Trans component={null}>Update collection</Trans>
          ) : (
            <Trans component={null}>Create collection</Trans>
          )}
        </Button>
      </Layout.Footer>
    </Layout>
  )
}
