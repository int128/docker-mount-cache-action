import * as cache from '@actions/cache'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as os from 'os'
import * as path from 'path'
import * as fs from 'fs/promises'

const runnerTempDir = process.env.RUNNER_TEMP || os.tmpdir()

type Inputs = {
  path: string
  key: string
  restoreKeys: string[]
}

export const run = async (inputs: Inputs): Promise<void> => {
  const cacheHitKey = await cache.restoreCache(['cache.tar'], inputs.key, inputs.restoreKeys)
  if (cacheHitKey === undefined) {
    core.info(`Cache not found for key ${inputs.key}`)
    return
  }

  const contextDir = await fs.mkdtemp(path.join(runnerTempDir, 'restore-cache-'))
  await fs.rename('cache.tar', path.join(contextDir, 'cache.tar'))
  await fs.writeFile(
    `${contextDir}/Dockerfile`,
    `
FROM busybox:stable
COPY cache.tar /cache.tar
ARG cache_target
RUN --mount=type=cache,target=\${cache_target} tar x -f /cache.tar -C \${cache_target}
`,
  )

  const iidfile = path.join(contextDir, 'iidfile')
  await exec.exec('docker', [
    'buildx',
    'build',
    '--build-arg',
    `cache_target=${inputs.path}`,
    '--iidfile',
    iidfile,
    contextDir,
  ])
  const imageID = (await fs.readFile(iidfile)).toString()
  await exec.exec('docker', ['image', 'rm', imageID])
  core.info(`Restored cache from key ${cacheHitKey}`)
}
