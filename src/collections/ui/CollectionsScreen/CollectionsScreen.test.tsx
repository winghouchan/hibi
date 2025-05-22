import { screen, waitFor } from '@testing-library/react-native'
import { Stack } from 'expo-router'
import { renderRouter } from 'expo-router/testing-library'
import { ErrorBoundary } from 'react-error-boundary'
import { View } from 'react-native'
import { mockCollections, mockCollectionsError } from '@/collections/test'
import { mockActiveCollection, mockActiveCollectionError } from '@/home/test'
import { mockAppRoot } from 'test/utils'
import CollectionsScreen from './CollectionsScreen'

const routerMock = {
  _layout: () => (
    <Stack
      screenLayout={({ children }) => (
        <ErrorBoundary
          fallback={<View testID="error-boundary-fallback-mock" />}
        >
          {children}
        </ErrorBoundary>
      )}
    />
  ),
  collections: CollectionsScreen,
} satisfies Parameters<typeof renderRouter>[0]

describe('<CollectionsScreen />', () => {
  test.each([
    {
      name: 'when there are fewer than 11 collections, shows all collections',
      fixture: {
        activeCollection: {
          id: 1,
          name: 'Test Collection 1',
          createdAt: new Date(),
        },
        collections: [
          { id: 1, name: 'Test Collection 1', createdAt: new Date() },
          { id: 2, name: 'Test Collection 2', createdAt: new Date() },
          { id: 3, name: 'Test Collection 3', createdAt: new Date() },
          { id: 4, name: 'Test Collection 4', createdAt: new Date() },
          { id: 5, name: 'Test Collection 5', createdAt: new Date() },
          { id: 6, name: 'Test Collection 6', createdAt: new Date() },
          { id: 7, name: 'Test Collection 7', createdAt: new Date() },
          { id: 8, name: 'Test Collection 8', createdAt: new Date() },
          { id: 9, name: 'Test Collection 9', createdAt: new Date() },
          { id: 10, name: 'Test Collection 10', createdAt: new Date() },
        ],
      },
      expected: async () => {
        expect(
          await screen.findByRole('menuitem', {
            name: 'Test Collection 1',
            selected: true,
          }),
        ).toBeOnTheScreen()
        expect(await screen.findAllByRole('menuitem')).toHaveLength(10)
      },
    },
    {
      name: 'when there are 11 collections, shows the first 10 collections',
      fixture: {
        activeCollection: {
          id: 1,
          name: 'Test Collection 1',
          createdAt: new Date(),
        },
        collections: [
          { id: 1, name: 'Test Collection 1', createdAt: new Date() },
          { id: 2, name: 'Test Collection 2', createdAt: new Date() },
          { id: 3, name: 'Test Collection 3', createdAt: new Date() },
          { id: 4, name: 'Test Collection 4', createdAt: new Date() },
          { id: 5, name: 'Test Collection 5', createdAt: new Date() },
          { id: 6, name: 'Test Collection 6', createdAt: new Date() },
          { id: 7, name: 'Test Collection 7', createdAt: new Date() },
          { id: 8, name: 'Test Collection 8', createdAt: new Date() },
          { id: 9, name: 'Test Collection 9', createdAt: new Date() },
          { id: 10, name: 'Test Collection 10', createdAt: new Date() },
          { id: 11, name: 'Test Collection 11', createdAt: new Date() },
        ],
      },
      expected: async () => {
        expect(
          await screen.findByRole('menuitem', {
            name: 'Test Collection 1',
            selected: true,
          }),
        ).toBeOnTheScreen()
        expect(await screen.findAllByRole('menuitem')).toHaveLength(10)
      },
    },
  ])('$name', async ({ expected, fixture }) => {
    mockActiveCollection(fixture.activeCollection)
    mockCollections({
      cursor: { next: undefined },
      collections: fixture.collections,
    })

    renderRouter(routerMock, {
      initialUrl: '/collections',
      wrapper: mockAppRoot(),
    })

    await waitFor(expected)
  })

  test('when there is an error getting the list of collections, an error message is shown', async () => {
    // Suppress console error from the error mock
    jest.spyOn(console, 'error').mockImplementation()

    mockActiveCollection({
      id: 1,
      name: 'Test Collection 1',
      createdAt: new Date(),
    })
    mockCollectionsError(new Error('Test Error'))

    renderRouter(routerMock, {
      initialUrl: '/collections',
      wrapper: mockAppRoot(),
    })

    expect(
      await screen.findByTestId('error-boundary-fallback-mock'),
    ).toBeOnTheScreen()
  })

  test('when there is an error getting the active collection, an error message is shown', async () => {
    // Suppress console error from the error mock
    jest.spyOn(console, 'error').mockImplementation()

    mockActiveCollectionError(new Error('Test Error'))
    mockCollections({
      cursor: { next: undefined },
      collections: [],
    })

    renderRouter(routerMock, {
      initialUrl: '/collections',
      wrapper: mockAppRoot(),
    })

    expect(
      await screen.findByTestId('error-boundary-fallback-mock'),
    ).toBeOnTheScreen()
  })
})
