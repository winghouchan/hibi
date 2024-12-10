import { by, device, element, expect, waitFor, web } from 'detox'

describe('Onboarding', () => {
  describe('when not started', () => {
    describe('and the app is opened at the index', () => {
      test('the onboarding journey can be completed', async () => {
        await device.launchApp({ delete: true })

        await expect(element(by.id('onboarding.welcome.screen'))).toBeVisible()

        await element(by.id('onboarding.welcome.cta.button')).tap()
        await expect(
          element(by.id('onboarding.collection.screen')),
        ).toBeVisible()

        await element(by.id('onboarding.collection.name.input')).typeText(
          'Collection Name',
        )
        await element(by.id('onboarding.collection.cta.button')).tap()
        await expect(element(by.id('onboarding.notes.screen'))).toBeVisible()

        await element(by.id('onboarding.notes.new-note.button')).tap()
        await expect(
          element(by.id('onboarding.note-editor.screen')),
        ).toBeVisible()

        device.getPlatform() === 'android' &&
          (await element(by.id('onboarding.note-editor.side-0.editor')).tap())
        await web(by.id('onboarding.note-editor.side-0.editor'))
          .element(by.web.className('tiptap'))
          .typeText('Front 1', true)
        device.getPlatform() === 'android' &&
          (await element(by.id('onboarding.note-editor.side-1.editor')).tap())
        await web(by.id('onboarding.note-editor.side-1.editor'))
          .element(by.web.className('tiptap'))
          .typeText('Back 1', true)
        await element(by.id('onboarding.note-editor.cta.button')).tap()
        await expect(element(by.id('onboarding.notes.screen'))).toBeVisible()

        await element(by.id('onboarding.notes.cta.button')).tap()
        await expect(element(by.id('home.screen'))).toBeVisible()
      })
    })

    describe('and the app is opened at the onboarding index', () => {
      test('the onboarding journey can be completed', async () => {
        await device.launchApp({
          delete: true,
          url: 'hibi://onboarding',
        })

        await expect(element(by.id('onboarding.welcome.screen'))).toBeVisible()

        await element(by.id('onboarding.welcome.cta.button')).tap()
        await expect(
          element(by.id('onboarding.collection.screen')),
        ).toBeVisible()

        await element(by.id('onboarding.collection.name.input')).typeText(
          'Collection Name',
        )
        await element(by.id('onboarding.collection.cta.button')).tap()
        await expect(element(by.id('onboarding.notes.screen'))).toBeVisible()

        await element(by.id('onboarding.notes.new-note.button')).tap()
        await expect(
          element(by.id('onboarding.note-editor.screen')),
        ).toBeVisible()

        device.getPlatform() === 'android' &&
          (await element(by.id('onboarding.note-editor.side-0.editor')).tap())
        await web(by.id('onboarding.note-editor.side-0.editor'))
          .element(by.web.className('tiptap'))
          .typeText('Front 1', true)
        device.getPlatform() === 'android' &&
          (await element(by.id('onboarding.note-editor.side-1.editor')).tap())
        await web(by.id('onboarding.note-editor.side-1.editor'))
          .element(by.web.className('tiptap'))
          .typeText('Back 1', true)
        await element(by.id('onboarding.note-editor.cta.button')).tap()
        await expect(element(by.id('onboarding.notes.screen'))).toBeVisible()

        await element(by.id('onboarding.notes.cta.button')).tap()
        await expect(element(by.id('home.screen'))).toBeVisible()
      })
    })

    describe('and the app is opened at the collection creation step', () => {
      test('the onboarding journey can be completed', async () => {
        await device.launchApp({
          delete: true,
          url: 'hibi://onboarding/collection',
        })

        await expect(
          element(by.id('onboarding.collection.screen')),
        ).toBeVisible()

        await element(by.id('onboarding.collection.name.input')).typeText(
          'Collection Name',
        )
        await element(by.id('onboarding.collection.cta.button')).tap()
        await expect(element(by.id('onboarding.notes.screen'))).toBeVisible()

        await element(by.id('onboarding.notes.new-note.button')).tap()
        await expect(
          element(by.id('onboarding.note-editor.screen')),
        ).toBeVisible()

        device.getPlatform() === 'android' &&
          (await element(by.id('onboarding.note-editor.side-0.editor')).tap())
        await web(by.id('onboarding.note-editor.side-0.editor'))
          .element(by.web.className('tiptap'))
          .typeText('Front 1', true)
        device.getPlatform() === 'android' &&
          (await element(by.id('onboarding.note-editor.side-1.editor')).tap())
        await web(by.id('onboarding.note-editor.side-1.editor'))
          .element(by.web.className('tiptap'))
          .typeText('Back 1', true)
        await element(by.id('onboarding.note-editor.cta.button')).tap()
        await expect(element(by.id('onboarding.notes.screen'))).toBeVisible()

        await element(by.id('onboarding.notes.cta.button')).tap()
        await expect(element(by.id('home.screen'))).toBeVisible()
      })
    })

    describe.each([
      {
        name: 'and the app is opened at the notes creation step',
        input: {
          url: 'onboarding/notes',
        },
      },
      {
        name: 'and the app is opened in the new note creator',
        input: {
          url: 'onboarding/notes/new',
        },
      },
      {
        name: 'and the app is opened in the note editor',
        input: {
          url: 'onboarding/notes/edit/1',
        },
      },
    ])('$name', ({ input }) => {
      test('the user is redirected to the welcome screen', async () => {
        await device.launchApp({
          delete: true,
          ...(input?.url && { url: `hibi://${input.url}` }),
        })

        await expect(element(by.id('onboarding.welcome.screen'))).toBeVisible()
      })
    })
  })

  describe('when a collection has been created', () => {
    describe('and the app is opened at the index', () => {
      test('the onboarding journey can be completed', async () => {
        await device.launchApp({
          delete: true,
          launchArgs: { databaseFixture: 'onboarding/collection-created' },
        })

        await expect(element(by.id('onboarding.welcome.screen'))).toBeVisible()

        await element(by.id('onboarding.welcome.cta.button')).tap()
        await expect(
          element(by.id('onboarding.collection.screen')),
        ).toBeVisible()

        await element(by.id('onboarding.collection.cta.button')).tap()
        await expect(element(by.id('onboarding.notes.screen'))).toBeVisible()

        await element(by.id('onboarding.notes.new-note.button')).tap()
        await expect(
          element(by.id('onboarding.note-editor.screen')),
        ).toBeVisible()

        device.getPlatform() === 'android' &&
          (await element(by.id('onboarding.note-editor.side-0.editor')).tap())
        await web(by.id('onboarding.note-editor.side-0.editor'))
          .element(by.web.className('tiptap'))
          .typeText('Front 1', true)
        device.getPlatform() === 'android' &&
          (await element(by.id('onboarding.note-editor.side-1.editor')).tap())
        await web(by.id('onboarding.note-editor.side-1.editor'))
          .element(by.web.className('tiptap'))
          .typeText('Back 1', true)
        await element(by.id('onboarding.note-editor.cta.button')).tap()
        await expect(element(by.id('onboarding.notes.screen'))).toBeVisible()

        await element(by.id('onboarding.notes.cta.button')).tap()
        await expect(element(by.id('home.screen'))).toBeVisible()
      })
    })

    describe('and the app is opened at the onboarding root', () => {
      test('the onboarding journey can be completed', async () => {
        await device.launchApp({
          delete: true,
          launchArgs: { databaseFixture: 'onboarding/collection-created' },
          url: 'hibi://onboarding',
        })

        await expect(element(by.id('onboarding.notes.screen'))).toBeVisible()

        await element(by.id('onboarding.notes.new-note.button')).tap()
        await expect(
          element(by.id('onboarding.note-editor.screen')),
        ).toBeVisible()

        device.getPlatform() === 'android' &&
          (await element(by.id('onboarding.note-editor.side-0.editor')).tap())
        await web(by.id('onboarding.note-editor.side-0.editor'))
          .element(by.web.className('tiptap'))
          .typeText('Front 1', true)
        device.getPlatform() === 'android' &&
          (await element(by.id('onboarding.note-editor.side-1.editor')).tap())
        await web(by.id('onboarding.note-editor.side-1.editor'))
          .element(by.web.className('tiptap'))
          .typeText('Back 1', true)
        await element(by.id('onboarding.note-editor.cta.button')).tap()
        await expect(element(by.id('onboarding.notes.screen'))).toBeVisible()

        await element(by.id('onboarding.notes.cta.button')).tap()
        await expect(element(by.id('home.screen'))).toBeVisible()
      })
    })

    describe('and the app is opened at the collection creation step', () => {
      test('the onboarding journey can be completed', async () => {
        await device.launchApp({
          delete: true,
          launchArgs: { databaseFixture: 'onboarding/collection-created' },
          url: 'hibi://onboarding/collection',
        })

        await expect(
          element(by.id('onboarding.collection.screen')),
        ).toBeVisible()

        await element(by.id('onboarding.collection.cta.button')).tap()
        await expect(element(by.id('onboarding.notes.screen'))).toBeVisible()

        await element(by.id('onboarding.notes.new-note.button')).tap()
        await expect(
          element(by.id('onboarding.note-editor.screen')),
        ).toBeVisible()

        device.getPlatform() === 'android' &&
          (await element(by.id('onboarding.note-editor.side-0.editor')).tap())
        await web(by.id('onboarding.note-editor.side-0.editor'))
          .element(by.web.className('tiptap'))
          .typeText('Front 1', true)
        device.getPlatform() === 'android' &&
          (await element(by.id('onboarding.note-editor.side-1.editor')).tap())
        await web(by.id('onboarding.note-editor.side-1.editor'))
          .element(by.web.className('tiptap'))
          .typeText('Back 1', true)
        await element(by.id('onboarding.note-editor.cta.button')).tap()
        await expect(element(by.id('onboarding.notes.screen'))).toBeVisible()

        await element(by.id('onboarding.notes.cta.button')).tap()
        await expect(element(by.id('home.screen'))).toBeVisible()
      })
    })

    describe('and the app is opened at the notes creation step', () => {
      test('the onboarding journey can be completed', async () => {
        await device.launchApp({
          delete: true,
          launchArgs: { databaseFixture: 'onboarding/collection-created' },
          url: 'hibi://onboarding/notes',
        })

        await expect(element(by.id('onboarding.notes.screen'))).toBeVisible()

        await element(by.id('onboarding.notes.new-note.button')).tap()
        await expect(
          element(by.id('onboarding.note-editor.screen')),
        ).toBeVisible()

        device.getPlatform() === 'android' &&
          (await element(by.id('onboarding.note-editor.side-0.editor')).tap())
        await web(by.id('onboarding.note-editor.side-0.editor'))
          .element(by.web.className('tiptap'))
          .typeText('Front 1', true)
        device.getPlatform() === 'android' &&
          (await element(by.id('onboarding.note-editor.side-1.editor')).tap())
        await web(by.id('onboarding.note-editor.side-1.editor'))
          .element(by.web.className('tiptap'))
          .typeText('Back 1', true)
        await element(by.id('onboarding.note-editor.cta.button')).tap()
        await expect(element(by.id('onboarding.notes.screen'))).toBeVisible()

        await element(by.id('onboarding.notes.cta.button')).tap()
        await expect(element(by.id('home.screen'))).toBeVisible()
      })
    })

    describe('and the app is opened in the new note creator', () => {
      test('the onboarding journey can be completed', async () => {
        await device.launchApp({
          delete: true,
          launchArgs: { databaseFixture: 'onboarding/collection-created' },
          url: 'hibi://onboarding/notes/new',
        })

        device.getPlatform() === 'android' &&
          (await element(by.id('onboarding.note-editor.side-0.editor')).tap())
        await web(by.id('onboarding.note-editor.side-0.editor'))
          .element(by.web.className('tiptap'))
          .typeText('Front 1', true)
        device.getPlatform() === 'android' &&
          (await element(by.id('onboarding.note-editor.side-1.editor')).tap())
        await web(by.id('onboarding.note-editor.side-1.editor'))
          .element(by.web.className('tiptap'))
          .typeText('Back 1', true)
        await element(by.id('onboarding.note-editor.cta.button')).tap()
        await expect(element(by.id('onboarding.notes.screen'))).toBeVisible()

        await element(by.id('onboarding.notes.cta.button')).tap()
        await expect(element(by.id('home.screen'))).toBeVisible()
      })
    })

    describe('and the app is opened in the note editor', () => {
      test('the onboarding journey can be completed', async () => {
        await device.launchApp({
          delete: true,
          launchArgs: { databaseFixture: 'onboarding/collection-created' },
          url: 'hibi://onboarding/notes/edit/1',
        })

        await element(by.text('OK')).tap()

        await expect(element(by.id('onboarding.notes.screen'))).toBeVisible()

        await element(by.id('onboarding.notes.new-note.button')).tap()
        await expect(
          element(by.id('onboarding.note-editor.screen')),
        ).toBeVisible()

        device.getPlatform() === 'android' &&
          (await element(by.id('onboarding.note-editor.side-0.editor')).tap())
        await web(by.id('onboarding.note-editor.side-0.editor'))
          .element(by.web.className('tiptap'))
          .typeText('Front 1', true)
        device.getPlatform() === 'android' &&
          (await element(by.id('onboarding.note-editor.side-1.editor')).tap())
        await web(by.id('onboarding.note-editor.side-1.editor'))
          .element(by.web.className('tiptap'))
          .typeText('Back 1', true)
        await element(by.id('onboarding.note-editor.cta.button')).tap()
        await expect(element(by.id('onboarding.notes.screen'))).toBeVisible()

        await element(by.id('onboarding.notes.cta.button')).tap()
        await expect(element(by.id('home.screen'))).toBeVisible()
      })
    })
  })

  describe('when a note has been created', () => {
    describe('and the app is opened at the index', () => {
      test('the onboarding journey can be completed', async () => {
        await device.launchApp({
          delete: true,
          launchArgs: { databaseFixture: 'onboarding/note-created' },
        })

        await expect(element(by.id('onboarding.welcome.screen'))).toBeVisible()

        await element(by.id('onboarding.welcome.cta.button')).tap()
        await expect(
          element(by.id('onboarding.collection.screen')),
        ).toBeVisible()

        await element(by.id('onboarding.collection.cta.button')).tap()
        await expect(element(by.id('onboarding.notes.screen'))).toBeVisible()

        await element(by.id('onboarding.notes.cta.button')).tap()
        await expect(element(by.id('home.screen'))).toBeVisible()
      })
    })

    describe('and the app is opened at the onboarding root', () => {
      test('the onboarding journey can be completed', async () => {
        await device.launchApp({
          delete: true,
          launchArgs: { databaseFixture: 'onboarding/note-created' },
          url: 'hibi://onboarding',
        })

        await expect(element(by.id('onboarding.notes.screen'))).toBeVisible()

        await element(by.id('onboarding.notes.cta.button')).tap()
        await expect(element(by.id('home.screen'))).toBeVisible()
      })
    })

    describe('and the app is opened at the collection creation step', () => {
      test('the onboarding journey can be completed', async () => {
        await device.launchApp({
          delete: true,
          launchArgs: { databaseFixture: 'onboarding/note-created' },
          url: 'hibi://onboarding/collection',
        })

        await expect(
          element(by.id('onboarding.collection.screen')),
        ).toBeVisible()

        await element(by.id('onboarding.collection.cta.button')).tap()
        await expect(element(by.id('onboarding.notes.screen'))).toBeVisible()

        await element(by.id('onboarding.notes.cta.button')).tap()
        await expect(element(by.id('home.screen'))).toBeVisible()
      })
    })

    describe('and the app is opened at the notes creation step', () => {
      test('the onboarding journey can be completed', async () => {
        await device.launchApp({
          delete: true,
          launchArgs: { databaseFixture: 'onboarding/note-created' },
          url: 'hibi://onboarding/notes',
        })

        await expect(element(by.id('onboarding.notes.screen'))).toBeVisible()

        await element(by.id('onboarding.notes.cta.button')).tap()
        await expect(element(by.id('home.screen'))).toBeVisible()
      })
    })

    describe('and the app is opened in the new note creator', () => {
      test('the onboarding journey can be completed', async () => {
        await device.launchApp({
          delete: true,
          launchArgs: { databaseFixture: 'onboarding/note-created' },
          url: 'hibi://onboarding/notes/new',
        })

        await expect(
          element(by.id('onboarding.note-editor.screen')),
        ).toBeVisible()

        device.getPlatform() === 'android' &&
          (await element(by.id('onboarding.note-editor.side-0.editor')).tap())
        await web(by.id('onboarding.note-editor.side-0.editor'))
          .element(by.web.className('tiptap'))
          .typeText('Front 1', true)
        device.getPlatform() === 'android' &&
          (await element(by.id('onboarding.note-editor.side-1.editor')).tap())
        await web(by.id('onboarding.note-editor.side-1.editor'))
          .element(by.web.className('tiptap'))
          .typeText('Back 1', true)
        await element(by.id('onboarding.note-editor.cta.button')).tap()
        await expect(element(by.id('onboarding.notes.screen'))).toBeVisible()

        await waitFor(element(by.id('onboarding.notes.cta.button')))
          .toBeVisible()
          .whileElement(by.id('onboarding.notes.screen'))
          .scroll(100, 'down')

        await element(by.id('onboarding.notes.cta.button')).tap()
        await expect(element(by.id('home.screen'))).toBeVisible()
      })
    })

    describe('and the app is opened in the note editor', () => {
      test('the onboarding journey can be completed', async () => {
        await device.launchApp({
          delete: true,
          launchArgs: { databaseFixture: 'onboarding/note-created' },
          url: 'hibi://onboarding/notes/edit/1',
        })

        await expect(
          element(by.id('onboarding.note-editor.screen')),
        ).toBeVisible()

        await element(by.id('onboarding.note-editor.cta.button')).tap()
        await expect(element(by.id('onboarding.notes.screen'))).toBeVisible()

        await element(by.id('onboarding.notes.cta.button')).tap()
        await expect(element(by.id('home.screen'))).toBeVisible()
      })
    })
  })

  describe('when complete', () => {
    describe.each([
      {
        name: 'and the app is opened at the index',
      },
      {
        name: 'and the app is opened at the onboarding root',
        input: {
          url: 'onboarding',
        },
      },
      {
        name: 'and the app is opened at the collection creation step',
        input: {
          url: 'onboarding/collection',
        },
      },
      {
        name: 'and the app is opened at the note creation step',
        input: {
          url: 'onboarding/notes',
        },
      },
      {
        name: 'and the app is opened in the new note creator',
        input: {
          url: 'onboarding/notes/new',
        },
      },
      {
        name: 'and the app is opened in the note editor',
        input: {
          url: 'onboarding/notes/edit/1',
        },
      },
    ])('$name', ({ input }) => {
      test('shows the home screen', async () => {
        await device.launchApp({
          delete: true,
          launchArgs: { databaseFixture: 'onboarding/complete' },
          ...(input?.url && { url: `hibi://${input.url}` }),
        })

        await expect(element(by.id('home.screen'))).toBeVisible()
      })
    })
  })
})
