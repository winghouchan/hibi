import { render, screen, userEvent } from '@testing-library/react-native'
import { Formik } from 'formik'
import TextInput from '.'

describe('<TextInput />', () => {
  describe('when given a name', () => {
    it('can be inputted', async () => {
      const user = userEvent.setup()
      const input = {
        fieldLabel: 'Text input field',
        fieldName: 'field',
        userInput: 'Input',
      }

      render(
        <Formik initialValues={{ field: '' }} onSubmit={jest.fn()}>
          {() => (
            <TextInput
              accessibilityLabel={input.fieldLabel}
              name={input.fieldName}
            />
          )}
        </Formik>,
      )

      await user.type(screen.getByLabelText(input.fieldLabel), input.userInput)

      expect(screen.getByDisplayValue(input.userInput)).toBeOnTheScreen()
    })
  })
})
