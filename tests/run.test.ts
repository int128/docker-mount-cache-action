import { run } from '../src/run'

test('run successfully', async () => {
  await expect(run({ key: 'foo', path: 'bar' })).resolves.toBeUndefined()
})
