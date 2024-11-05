import { user } from '@/user/schema'
import { mockDatabase } from 'test/utils'

describe('completeOnboarding', () => {
  test.each([
    {
      name: 'when there is no existing user record, creates a user record and sets `is_onboarded` to `true`',
      fixture: {
        user: undefined,
      },
      expected: {
        onboarded: true,
      },
    },
    {
      name: 'when there is an existing user record, updates the user record `is_onboarded` to `true`',
      fixture: {
        user: {
          id: 1,
          onboarded: false,
        },
      },
      expected: {
        onboarded: true,
      },
    },
  ])('$name', async ({ fixture, expected }) => {
    const { database, resetDatabaseMock } = await mockDatabase()
    const { default: completeOnboarding } = await import('./completeOnboarding')

    if (fixture.user) {
      await database.insert(user).values(fixture.user)
    }

    await completeOnboarding()

    const output = await database.query.user.findFirst()

    expect(output).toEqual(expect.objectContaining(expected))

    resetDatabaseMock()
  })
})
