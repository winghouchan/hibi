import { by, device, element, expect } from 'detox'

describe('Onboarding', () => {
  describe('when incomplete', () => {
    beforeAll(async () => {
      await device.launchApp({ delete: true })
    })

    test('the onboarding journey can be completed', async () => {
      await expect(element(by.id('onboarding.welcome.screen'))).toBeVisible()

      await element(by.id('onboarding.welcome.cta.button')).tap()
      await expect(element(by.id('onboarding.collection.screen'))).toBeVisible()

      await element(by.id('onboarding.collection.name.input')).typeText(
        'Collection Name',
      )
      await element(by.id('onboarding.collection.cta.button')).tap()
      await expect(element(by.id('onboarding.notes.screen'))).toBeVisible()

      await element(by.id('onboarding.notes.new-note.button')).tap()
      await expect(
        element(by.id('onboarding.note-editor.screen')),
      ).toBeVisible()

      await element(
        by.id('onboarding.note-editor.side-0.field-0.input'),
      ).typeText('Front 1')
      await element(
        by.id('onboarding.note-editor.side-1.field-0.input'),
      ).typeText('Back 1')
      await element(by.id('onboarding.note-editor.cta.button')).tap()
      await expect(element(by.id('onboarding.notes.screen'))).toBeVisible()

      await element(by.id('onboarding.notes.cta.button')).tap()
      await expect(element(by.id('home.screen'))).toBeVisible()
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
