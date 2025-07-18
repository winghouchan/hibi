import { act, screen, userEvent } from '@testing-library/react-native'
import { renderRouter } from 'expo-router/testing-library'
import { Text } from 'react-native'
import { mockAppRoot } from 'test/utils'
import Select from './Select'

const fixture = {
  data: [
    { id: 1, text: 'Option 1' },
    { id: 2, text: 'Option 2' },
    { id: 3, text: 'Option 3' },
    { id: 4, text: 'Option 4' },
  ],
  label: 'Select an option',
}

describe('<Select />', () => {
  test.each([
    {
      name: 'when 0 selections have been made, can select 0 options and confirm selection',
      fixture: {
        ...fixture,
        value: [],
      },
      input: {
        selections: [],
        unselections: [],
      },
    },
    {
      name: 'when 0 selections have been made, can select 0 options and cancel selection',
      fixture: {
        ...fixture,
        value: [],
      },
      input: {
        selections: [],
        unselections: [],
        cancel: true,
      },
    },
    {
      name: 'when 0 selections have been made, can select 1 option and confirm selection',
      fixture: {
        ...fixture,
        value: [],
      },
      input: {
        selections: [fixture.data[0]],
        unselections: [],
      },
    },
    {
      name: 'when 0 selections have been made, can select 1 option and cancel selection',
      fixture: {
        ...fixture,
        value: [],
      },
      input: {
        selections: [fixture.data[0]],
        unselections: [],
        cancel: true,
      },
    },
    {
      name: 'when 0 selections have been made, can select more than 1 option and confirm selection',
      fixture: {
        ...fixture,
        value: [],
      },
      input: {
        selections: fixture.data,
        unselections: [],
      },
    },
    {
      name: 'when 0 selections have been made, can select more than 1 option and cancel selection',
      fixture: {
        ...fixture,
        value: [],
      },
      input: {
        selections: fixture.data,
        unselections: [],
        cancel: true,
      },
    },
    {
      name: 'when 1 selection has been made, can select 0 additional options and confirm selection',
      fixture: {
        ...fixture,
        value: [fixture.data[0]],
      },
      input: {
        selections: [],
        unselections: [],
      },
    },
    {
      name: 'when 1 selection has been made, can select 0 additional options and cancel selection',
      fixture: {
        ...fixture,
        value: [fixture.data[0]],
      },
      input: {
        selections: [],
        unselections: [],
        cancel: true,
      },
    },
    {
      name: 'when 1 selection has been made, can select 1 additional option and confirm selection',
      fixture: {
        ...fixture,
        value: [fixture.data[0]],
      },
      input: {
        selections: [fixture.data[1]],
        unselections: [],
      },
    },
    {
      name: 'when 1 selection has been made, can select 1 additional option and cancel selection',
      fixture: {
        ...fixture,
        value: [fixture.data[0]],
      },
      input: {
        selections: [fixture.data[1]],
        unselections: [],
        cancel: true,
      },
    },
    {
      name: 'when 1 selection has been made, can select more than 1 additional option and confirm selection',
      fixture: {
        ...fixture,
        value: [fixture.data[0]],
      },
      input: {
        selections: [fixture.data[1], fixture.data[2]],
        unselections: [],
      },
    },
    {
      name: 'when 1 selection has been made, can select more than 1 additional option and cancel selection',
      fixture: {
        ...fixture,
        value: [fixture.data[0]],
      },
      input: {
        selections: [fixture.data[1], fixture.data[2]],
        unselections: [],
        cancel: true,
      },
    },
    {
      name: 'when 1 selection has been made, can un-select all selections and confirm un-selection',
      fixture: {
        ...fixture,
        value: [fixture.data[0]],
      },
      input: {
        selections: [],
        unselections: [fixture.data[0]],
      },
    },
    {
      name: 'when 1 selection has been made, can un-select all selections and cancel un-selection',
      fixture: {
        ...fixture,
        value: [fixture.data[0]],
      },
      input: {
        selections: [],
        unselections: [fixture.data[0]],
        cancel: true,
      },
    },
    {
      name: 'when more than 1 selection has been made, can select 0 additional options and confirm selection',
      fixture: {
        ...fixture,
        value: [fixture.data[0], fixture.data[1]],
      },
      input: {
        selections: [],
        unselections: [],
      },
    },
    {
      name: 'when more than 1 selection has been made, can select 0 additional options and cancel selection',
      fixture: {
        ...fixture,
        value: [fixture.data[0], fixture.data[1]],
      },
      input: {
        selections: [],
        unselections: [],
        cancel: true,
      },
    },
    {
      name: 'when more than 1 selection has been made, can select 1 additional option and confirm selection',
      fixture: {
        ...fixture,
        value: [fixture.data[0], fixture.data[1]],
      },
      input: {
        selections: [fixture.data[2]],
        unselections: [],
      },
    },
    {
      name: 'when more than 1 selection has been made, can select 1 additional option and cancel selection',
      fixture: {
        ...fixture,
        value: [fixture.data[0], fixture.data[1]],
      },
      input: {
        selections: [fixture.data[2]],
        unselections: [],
        cancel: true,
      },
    },
    {
      name: 'when more than 1 selection has been made, can select more than 1 additional option and confirm selection',
      fixture: {
        ...fixture,
        value: [fixture.data[0], fixture.data[1]],
      },
      input: {
        selections: [fixture.data[2], fixture.data[3]],
        unselections: [],
      },
    },
    {
      name: 'when more than 1 selection has been made, can select more than 1 additional option and cancel selection',
      fixture: {
        ...fixture,
        value: [fixture.data[0], fixture.data[1]],
      },
      input: {
        selections: [fixture.data[2], fixture.data[3]],
        unselections: [],
        cancel: true,
      },
    },
    {
      name: 'when more than 1 selection has been made, can un-select 1 selection and confirm un-selection',
      fixture: {
        ...fixture,
        value: [fixture.data[0], fixture.data[1]],
      },
      input: {
        selections: [],
        unselections: [fixture.data[0]],
      },
    },
    {
      name: 'when more than 1 selection has been made, can un-select 1 selection and cancel un-selection',
      fixture: {
        ...fixture,
        value: [fixture.data[0], fixture.data[1]],
      },
      input: {
        selections: [],
        unselections: [fixture.data[0]],
        cancel: true,
      },
    },
    {
      name: 'when more than 1 selection has been made, can un-select all selections and confirm un-selection',
      fixture: {
        ...fixture,
        value: [fixture.data[0], fixture.data[1]],
      },
      input: {
        selections: [],
        unselections: [fixture.data[0], fixture.data[1]],
      },
    },
    {
      name: 'when more than 1 selection has been made, can un-select all selections and cancel un-selection',
      fixture: {
        ...fixture,
        value: [fixture.data[0], fixture.data[1]],
      },
      input: {
        selections: [],
        unselections: [fixture.data[0], fixture.data[1]],
        cancel: true,
      },
    },
  ])('$name', async ({ fixture, input }) => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    const onOpen = jest.fn()
    const onClose = jest.fn()

    // The component needs a mock of the screen's safe area which `renderRouter` mocks
    await renderRouter(
      {
        index: () => (
          <Select onChange={onChange} value={fixture.value.map(({ id }) => id)}>
            <Select.Button>{fixture.label}</Select.Button>
            <Select.Options
              data={fixture.data}
              renderItem={({ item: { text } }) => <Text>{text}</Text>}
              title={fixture.label}
              onOpen={onOpen}
              onClose={onClose}
            />
          </Select>
        ),
      },
      { wrapper: mockAppRoot() },
    )

    const openButton = screen.getByRole('button', { name: fixture.label })

    await user.press(openButton)

    expect(onOpen).toHaveBeenCalledOnce()

    fixture.value.forEach((value) => {
      const option = screen.getByRole('button', { name: value.text })
      expect(option).toBeSelected()
    })

    for (const selection of input.selections) {
      const option = screen.getByRole('button', { name: selection.text })
      await user.press(option)
      expect(option).toBeSelected()
    }

    for (const unselection of input.unselections) {
      const option = screen.getByRole('button', { name: unselection.text })
      await user.press(option)
      expect(option).not.toBeSelected()
    }

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    const doneButton = screen.getByRole('button', { name: 'Done' })

    if (!input.cancel) {
      await user.press(doneButton)
      // eslint-disable-next-line jest/no-conditional-expect -- conditional removes need for duplicating test body
      expect(onChange).toHaveBeenCalledExactlyOnceWith([
        ...fixture.value
          .filter(
            (value) =>
              !input.unselections?.map(({ id }) => id).includes(value.id),
          )
          .map(({ id }) => id),
        ...input.selections.map(({ id }) => id),
      ])
    } else {
      await user.press(cancelButton)
      // eslint-disable-next-line jest/no-conditional-expect -- conditional removes need for duplicating test body
      expect(onChange).not.toHaveBeenCalled()
    }

    expect(onClose).toHaveBeenCalledOnce()
  })
})
