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
  const code = await exec.exec('docker', ['pull', '--quiet', inputs.tags], { ignoreReturnCode: true })
  if (code !== 0) {
    core.info(`Cache not found for ${inputs.tags}`)
    return
  }

  const contextDir = await fs.mkdtemp(path.join(runnerTempDir, 'restore-cache-'))
  await fs.writeFile(
    `${contextDir}/Dockerfile`,
    `
FROM ${inputs.tags}
RUN --mount=type=cache,target=${inputs.path} tar x -v -f /cache.tar -C ${inputs.path}
`,
  )
  await exec.exec('docker', ['buildx', 'build', contextDir])
  core.info(`Restored cache from ${inputs.tags} to ${inputs.path}`)
}
