import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as os from 'os'
import * as fs from 'fs/promises'

type Inputs = object

export const run = async (inputs: Inputs): Promise<void> => {
  core.info(`GITHUB_ACTION_PATH=${process.env.GITHUB_ACTION_PATH}`)

  inputs

  const tempDir = await fs.mkdtemp(process.env.RUNNER_TEMP || os.tmpdir())

  await fs.writeFile(
    `${tempDir}/Dockerfile`,
    `
FROM busybox:1
RUN --mount=type=cache,target="$(read_action_input cache-target)" \
    --mount=type=bind,source=.,target=/var/dance-cache \
    cp -p -R /var/dance-cache/. "$(read_action_input cache-target)" || true
`,
  )

  await exec.exec('docker', ['buildx', 'build', '-f'])
}
