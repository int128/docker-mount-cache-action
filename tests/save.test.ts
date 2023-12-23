import { run } from '../src/save/run'

test('run successfully', async () => {
  await expect(run({ key: 'foo', path: 'bar' })).resolves.toBeUndefined()
})
