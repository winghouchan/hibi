export default jest.fn(({ id, name }) => ({
  id,
  name,
  date: new Date(),
}))
