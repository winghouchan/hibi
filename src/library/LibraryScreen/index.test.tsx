import {
  render,
  screen,
  userEvent,
  waitFor,
} from '@testing-library/react-native'
import { Alert } from 'react-native'
import { mockCollections, mockCollectionsError } from '@/collections/test'
import { mockAppRoot } from 'test/utils'
import LibraryScreen from '.'

describe('<LibraryScreen />', () => {
  test.each([
    {
      name: 'when there is 1 collection, it is shown',
      fixture: {
        collections: [{ id: 1, name: 'Collection 1', createdAt: new Date() }],
      },
    },
    {
      name: 'when there are 10 collections, they are shown',
      fixture: {
        collections: [
          { id: 1, name: 'Collection 1', createdAt: new Date() },
          { id: 2, name: 'Collection, 2', createdAt: new Date() },
          { id: 3, name: 'Collection, 3', createdAt: new Date() },
          { id: 4, name: 'Collection, 4', createdAt: new Date() },
          { id: 5, name: 'Collection, 5', createdAt: new Date() },
          { id: 6, name: 'Collection, 6', createdAt: new Date() },
          { id: 7, name: 'Collection, 7', createdAt: new Date() },
          { id: 8, name: 'Collection, 8', createdAt: new Date() },
          { id: 9, name: 'Collection, 9', createdAt: new Date() },
          { id: 10, name: 'Collection, 10', createdAt: new Date() },
        ],
      },
    },
    {
      name: 'when there are 11 collections, the first 10 are shown',
      fixture: {
        collections: [
          { id: 1, name: 'Collection 1', createdAt: new Date() },
          { id: 2, name: 'Collection, 2', createdAt: new Date() },
          { id: 3, name: 'Collection, 3', createdAt: new Date() },
          { id: 4, name: 'Collection, 4', createdAt: new Date() },
          { id: 5, name: 'Collection, 5', createdAt: new Date() },
          { id: 6, name: 'Collection, 6', createdAt: new Date() },
          { id: 7, name: 'Collection, 7', createdAt: new Date() },
          { id: 8, name: 'Collection, 8', createdAt: new Date() },
          { id: 9, name: 'Collection, 9', createdAt: new Date() },
          { id: 10, name: 'Collection, 10', createdAt: new Date() },
          { id: 11, name: 'Collection, 11', createdAt: new Date() },
        ],
      },
    },
  ])('$name', async ({ fixture }) => {
    mockCollections(fixture.collections)

    render(<LibraryScreen />, { wrapper: mockAppRoot() })

    await Promise.all(
      fixture.collections.slice(0, 10).map(async ({ name }) => {
        expect(await screen.findByText(name)).toBeOnTheScreen()
      }),
    )
  })

  test('when there are 0 collections, the user is informed', async () => {
    mockCollections([])

    render(<LibraryScreen />, { wrapper: mockAppRoot() })

    expect(await screen.findByText('No collections')).toBeOnTheScreen()
  })

  test('when there is an error getting collections, the user is alerted', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert')

    mockCollectionsError(new Error('Mock Error'))

    render(<LibraryScreen />, { wrapper: mockAppRoot() })

    await waitFor(() => expect(alertSpy).toHaveBeenCalledOnce())
  })

  test('when there are more than 10 collections and the user scrolls, the items after the 10th item are displayed', async () => {
    const fixture = {
      collections: [
        { id: 1, name: 'Collection 1', createdAt: new Date() },
        { id: 2, name: 'Collection, 2', createdAt: new Date() },
        { id: 3, name: 'Collection, 3', createdAt: new Date() },
        { id: 4, name: 'Collection, 4', createdAt: new Date() },
        { id: 5, name: 'Collection, 5', createdAt: new Date() },
        { id: 6, name: 'Collection, 6', createdAt: new Date() },
        { id: 7, name: 'Collection, 7', createdAt: new Date() },
        { id: 8, name: 'Collection, 8', createdAt: new Date() },
        { id: 9, name: 'Collection, 9', createdAt: new Date() },
        { id: 10, name: 'Collection, 10', createdAt: new Date() },
        { id: 11, name: 'Collection, 11', createdAt: new Date() },
      ],
    }
    const user = userEvent.setup()

    mockCollections(fixture.collections)

    render(<LibraryScreen />, { wrapper: mockAppRoot() })

    await Promise.all(
      fixture.collections.slice(0, 10).map(async ({ name }) => {
        expect(await screen.findByText(name)).toBeOnTheScreen()
      }),
    )

    await user.scrollTo(await screen.findByTestId('library.collection.list'), {
      y: 1,
      contentSize: { height: 1, width: 1 },
      layoutMeasurement: { height: 1, width: 1 },
    })

    await Promise.all(
      fixture.collections.map(async ({ name }) => {
        expect(await screen.findByText(name)).toBeOnTheScreen()
      }),
    )
  })
})
