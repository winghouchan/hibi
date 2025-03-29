import { useLingui } from '@lingui/react/macro'
import { useSuspenseQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Alert } from 'react-native'
import { object, string } from 'yup'
import { Button, Text, TextField } from '@/ui'
import { onboardingCollectionQuery } from '../../operations'
import Layout from '../Layout'
import useForm from './useForm'

export default function CollectionScreen() {
  /**
   * Works around an issue where focusing on the text input does not cause the
   * `Layout` component to adjust the layout to avoid the keyboard.
   *
   * @see {@link https://github.com/jpudysz/react-native-unistyles/issues/368}
   */
  // eslint-disable-next-line react-compiler/react-compiler
  'use no memo'

  const { t: translate } = useLingui()
  const { data: collection } = useSuspenseQuery(onboardingCollectionQuery)

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
      translate`Something went wrong`,
      typeof collection?.id === 'undefined'
        ? translate`There was an error creating the collection`
        : translate`There was an error updating the collection`,
      [
        {
          text: translate`Try again`,
          style: 'default',
          isPreferred: true,
          onPress: retry,
        },
        {
          text: translate`Cancel`,
          style: 'cancel',
        },
      ],
    )
  }

  const validationSchema = object({
    name: string().required(translate`Your collection needs a name`),
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
        <Text size="heading">{translate`What are you learning?`}</Text>
        <TextField
          accessibilityLabel={translate`Enter a collection name`}
          autoFocus
          error={errors.name}
          onChangeText={(value) => handleChange('name')(value)}
          onSubmitEditing={() => handleSubmit()}
          placeholder={translate`Collection name`}
          testID="onboarding.collection.name"
          value={values.name}
        />
      </Layout.Main>
      <Layout.Footer>
        <Button
          testID="onboarding.collection.cta"
          onPress={() => handleSubmit()}
        >
          {isSubmitting
            ? translate`Submitting`
            : values.id
              ? translate`Update collection`
              : translate`Create collection`}
        </Button>
      </Layout.Footer>
    </Layout>
  )
}
