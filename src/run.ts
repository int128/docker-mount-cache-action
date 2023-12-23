import * as cache from '@actions/cache'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as os from 'os'
import * as fs from 'fs/promises'

type Inputs = {
  path: string
  key: string
}

export const run = async (inputs: Inputs): Promise<void> => {
  if (process.env.INPUT_AGENT) {
    core.info(`Restoring cache for ${inputs.path}`)
    await cache.restoreCache([inputs.path], inputs.key)
    return
  }

  const thisScriptPath = process.argv[1]
  const tempDir = await fs.mkdtemp(process.env.RUNNER_TEMP || os.tmpdir())
  await fs.copyFile(thisScriptPath, `${tempDir}/dist.js`)
  await fs.writeFile(
    `${tempDir}/Dockerfile`,
    `
FROM node:${process.version.replace(/^v/, '')}-alpine
ARG INPUT_PATH
ARG INPUT_KEY
COPY index.js .
RUN --mount=type=cache,target="${inputs.path}" INPUT_AGENT=1 node dist.js
`,
  )

  await exec.exec('docker', [
    'buildx',
    'build',
    '--build-arg',
    `INPUT_PATH=${inputs.path}`,
    '--build-arg',
    `INPUT_KEY=${inputs.key}`,
    tempDir,
  ])
}
