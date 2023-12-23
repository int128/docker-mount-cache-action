import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as fs from 'fs/promises'

type Inputs = {
  path: string
  fromTags: string[]
  toTags: string[]
  contextDir: string
}

export const saveCache = async (inputs: Inputs): Promise<void> => {
  await fs.writeFile(
    `${inputs.contextDir}/Dockerfile`,
    `
FROM busybox:stable
RUN --mount=type=cache,target=${inputs.path} tar c -v -f /cache.tar -C ${inputs.path} .
`,
  )
  await exec.exec('docker', [
    'buildx',
    'build',
    ...inputs.toTags.flatMap((tag) => ['--tag', tag]),
    '--push',
    inputs.contextDir,
  ])
  core.info(`Pushed cache from ${inputs.path} to ${inputs.toTags.join(', ')}`)
}

export const restoreCache = async (inputs: Inputs): Promise<void> => {
  const cacheTag = await findExistingTag(inputs.toTags)
  if (!cacheTag) {
    core.info(`Cache not found`)
    return
  }

  await fs.writeFile(
    `${inputs.contextDir}/Dockerfile`,
    `
FROM ${cacheTag}
RUN --mount=type=cache,target=${inputs.path} tar x -v -f /cache.tar -C ${inputs.path}
`,
  )
  await exec.exec('docker', ['buildx', 'build', inputs.contextDir])
  core.info(`Restored cache from ${cacheTag} to ${inputs.path}`)
}

const findExistingTag = async (tags: string[]): Promise<string | undefined> => {
  for (const tag of tags) {
    const code = await exec.exec('docker', ['image', 'pull', '--quiet', tag], { ignoreReturnCode: true })
    if (code === 0) {
      return tag
    }
  }
}
