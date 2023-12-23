import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as os from 'os'
import * as path from 'path'
import * as fs from 'fs/promises'

const runnerTempDir = process.env.RUNNER_TEMP || os.tmpdir()

type Inputs = {
  path: string
  tags: string
}

export const run = async (inputs: Inputs): Promise<void> => {
  const contextDir = await fs.mkdtemp(path.join(runnerTempDir, 'save-cache-'))
  await fs.writeFile(
    `${contextDir}/Dockerfile`,
    `
FROM busybox:stable
RUN --mount=type=cache,target=${inputs.path} tar c -v -f /cache.tar -C ${inputs.path} .
`,
  )
  await exec.exec('docker', ['buildx', 'build', '--tag', inputs.tags, '--push', contextDir])
  core.info(`Pushed cache from ${inputs.path} to ${inputs.tags}`)
}
