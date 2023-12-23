import { run } from '../src/save/run'

test('run successfully', async () => {
  await expect(run({ tags: 'foo', path: 'bar' })).resolves.toBeUndefined()
})
