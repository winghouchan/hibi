import { by, device, element, expect } from 'detox'

describe('Onboarding', () => {
  describe('when incomplete', () => {
    beforeAll(async () => {
      await device.launchApp({ delete: true })
    })

    test('shows the welcome screen', async () => {
      await expect(element(by.id('onboarding.welcome.screen'))).toBeVisible()
    })
  })

  describe('when complete', () => {
    beforeAll(async () => {
      await device.launchApp({
        delete: true,
        launchArgs: { databaseFixture: 'onboarding/complete' },
      })
    })

    test('on app open, shows the home screen', async () => {
      await expect(element(by.id('home.screen'))).toBeVisible()
    })
  })
})
