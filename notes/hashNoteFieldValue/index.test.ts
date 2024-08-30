import hash from 'sha.js'
import hashNoteFieldValue from '.'

describe('hashNoteFieldValue', () => {
  it('hashes using the sha256 algorithm and returns the digest in base64', () => {
    const input = 'input'

    const expected = hash('sha256').update(input).digest('base64')

    const output = hashNoteFieldValue(input)

    expect(output).toEqual(expected)
  })
})
