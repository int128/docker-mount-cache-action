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
}

export const run = async (inputs: Inputs): Promise<void> => {
  const contextDir = await fs.mkdtemp(path.join(runnerTempDir, 'save-cache-'))

  await fs.writeFile(
    `${contextDir}/Dockerfile`,
    `
FROM busybox:stable
ARG cache_target
RUN --mount=type=cache,target=\${cache_target} tar c -v -f /cache.tar -C \${cache_target} .
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

  const cidfile = path.join(contextDir, 'cidfile')
  await exec.exec('docker', ['container', 'create', '--cidfile', cidfile, imageID])
  const containerID = (await fs.readFile(cidfile)).toString()

  await exec.exec('docker', ['container', 'cp', `${containerID}:/cache.tar`, '.'])
  await exec.exec('docker', ['container', 'rm', containerID])
  await exec.exec('docker', ['image', 'rm', imageID])

  core.info(`Saving cache as key ${inputs.key}`)
  await cache.saveCache(['cache.tar'], inputs.key)
  core.info(`Removing cache.tar`)
  await fs.rm('cache.tar')
  core.info(`Saved cache as key ${inputs.key}`)
}
