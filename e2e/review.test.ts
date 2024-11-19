import { by, element, expect } from 'detox'

describe('Review', () => {
  describe('when onboarding has been completed', () => {
    describe('and there are new reviewables', () => {
      test('can be finished', async () => {
        await device.launchApp({
          delete: true,
          launchArgs: { databaseFixture: 'review' },
        })

        await expect(element(by.id('home.screen'))).toBeVisible()

        await element(by.id('home.screen.cta.button')).tap()
        await expect(element(by.id('review.screen'))).toBeVisible()

        await element(by.id('review.show-answer.button')).tap()
        await element(by.id('review.rate.easy.button')).tap()
        await expect(element(by.id('review.finished.screen'))).toBeVisible()

        await element(by.id('review.finish.button')).tap()
        await expect(element(by.id('home.screen'))).toBeVisible()
      })
    })
  })

  describe('when onboarding has not been completed', () => {
    test('the user is redirected to the welcome screen', async () => {
      await device.launchApp({
        delete: true,
        url: 'hibi://review',
      })

      await expect(element(by.id('onboarding.welcome.screen'))).toBeVisible()
    })
  })
})
