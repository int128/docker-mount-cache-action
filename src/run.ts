import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as fs from 'fs/promises'

type Inputs = {
  path: string
  tags: string[]
  contextDir: string
  internalMode?: string
}

export const run = async (inputs: Inputs): Promise<void> => {
  if (inputs.internalMode === 'save') {
    return await saveCache(inputs)
  }
  if (inputs.internalMode === 'restore') {
    return await restoreCache(inputs)
  }
  throw new Error(`internal error: unknown internal-mode=${inputs.internalMode}`)
}

export const saveCache = async (inputs: Inputs): Promise<void> => {
  await fs.writeFile(
    `${inputs.contextDir}/Dockerfile`,
    `
FROM busybox:stable AS creator
RUN --mount=type=cache,target=${inputs.path} \
    tar c -f /cache.tar -C ${inputs.path} . && \
    ls -l /cache.tar
`,
  )
  await exec.exec('docker', [
    'buildx',
    'build',
    ...inputs.tags.flatMap((tag) => ['--tag', tag]),
    '--push',
    inputs.contextDir,
  ])
  core.info(`Pushed cache from ${inputs.path} to ${inputs.tags.join(', ')}`)
}

export const restoreCache = async (inputs: Inputs): Promise<void> => {
  const cacheTag = await findExistingTag(inputs.tags)
  if (!cacheTag) {
    core.info(`Cache not found`)
    return
  }

  await fs.writeFile(
    `${inputs.contextDir}/Dockerfile`,
    `
FROM ${cacheTag} AS cache
FROM busybox:stable
COPY --from=cache /cache.tar /cache.tar
RUN --mount=type=cache,target=${inputs.path} \
    ls -l /cache.tar && \
    tar x -f /cache.tar -C ${inputs.path}
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
