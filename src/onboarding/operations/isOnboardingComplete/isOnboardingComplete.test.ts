import { user } from '@/user/schema'
import { mockDatabase } from 'test/utils'

describe('isOnboardingComplete', () => {
  test.each([
    {
      name: 'when the user has not completed onboarding, returns `false`',
      fixture: {
        user: {
          onboarded: false,
        },
      },
      expected: false,
    },
    {
      name: 'when the user has completed onboarding, returns `true`',
      fixture: {
        user: {
          onboarded: true,
        },
      },
      expected: true,
    },
  ])('$name', async ({ fixture, expected }) => {
    const { database, resetDatabaseMock } = await mockDatabase()
    const { default: isOnboardingComplete } = await import(
      './isOnboardingComplete'
    )

    await database.insert(user).values(fixture.user)

    const output = await isOnboardingComplete()

    expect(output).toEqual(expected)

    resetDatabaseMock()
  })
})
