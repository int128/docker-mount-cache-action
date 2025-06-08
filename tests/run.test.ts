import * as exec from '@actions/exec'
import * as fs from 'fs/promises'
import * as os from 'os'
import * as path from 'path'
import { restoreCache, saveCache } from '../src/run.js'
import { describe, it, expect, vi } from 'vitest'
vi.mock('@actions/exec')

describe('saveCache', () => {
  it('should save the cache into an image', async () => {
    const contextDir = await fs.mkdtemp(path.join(os.tmpdir(), 'context-'))
    await saveCache({
      path: '/root/.cache/go-build',
      tags: ['ghcr.io/cache:go-build'],
      contextDir,
    })
    expect(exec.exec).toHaveBeenCalledWith('docker', [
      'buildx',
      'build',
      '--tag',
      'ghcr.io/cache:go-build',
      '--push',
      contextDir,
    ])
  })
})

describe('restoreCache', () => {
  it('should restore the cache from an image', async () => {
    vi.mocked(exec.exec).mockResolvedValue(0)
    const contextDir = await fs.mkdtemp(path.join(os.tmpdir(), 'context-'))
    await restoreCache({
      path: '/root/.cache/go-build',
      tags: ['ghcr.io/cache:go-build'],
      contextDir,
    })
    expect(exec.exec).toHaveBeenCalledWith('docker', ['image', 'pull', '--quiet', 'ghcr.io/cache:go-build'], {
      ignoreReturnCode: true,
    })
    expect(exec.exec).toHaveBeenCalledWith('docker', ['buildx', 'build', contextDir])
  })
})
