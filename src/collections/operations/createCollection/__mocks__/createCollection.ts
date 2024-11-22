export default jest.fn(({ name }) => ({
  id: 1,
  name,
  date: new Date(),
}))
