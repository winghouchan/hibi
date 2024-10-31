import { useQuery } from '@tanstack/react-query'
import { render, waitFor } from '@testing-library/react-native'
import { Alert } from 'react-native'
import { mockAppRoot } from 'test/utils'

describe('<DataProvider />', () => {
  describe('when a query errors', () => {
    describe('without a title', () => {
      test('only one alert is shown with the default title and provided message', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert')
        const message = 'Error'

        const Component = jest.fn(() => {
          useQuery({
            queryKey: ['test'],
            queryFn: async () => {
              throw new Error(message)
            },
          })

          return null
        })

        render(
          <>
            <Component />
            <Component />
          </>,
          {
            wrapper: mockAppRoot(),
          },
        )

        expect(Component).toHaveBeenCalledTimes(2)
        await waitFor(() => {
          expect(alertSpy).toHaveBeenCalledOnce()
        })
        expect(alertSpy.mock.calls[0]).toEqual(
          expect.arrayContaining(['Something went wrong', message]),
        )
      })
    })

    describe('with a title', () => {
      test('only one alert is shown with the title and provided message', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert')

        const title = 'Error with title'
        const message = 'Error'

        class ErrorWithTitle extends Error {
          name = 'ErrorWithTitle'

          title = title
        }

        const Component = jest.fn(() => {
          useQuery({
            queryKey: ['test'],
            queryFn: async () => {
              throw new ErrorWithTitle(message)
            },
          })

          return null
        })

        render(
          <>
            <Component />
            <Component />
          </>,
          {
            wrapper: mockAppRoot(),
          },
        )

        expect(Component).toHaveBeenCalledTimes(2)
        await waitFor(() => {
          expect(alertSpy).toHaveBeenCalledOnce()
        })
        expect(alertSpy.mock.calls[0]).toEqual(
          expect.arrayContaining([title, message]),
        )
      })
    })
  })
})
