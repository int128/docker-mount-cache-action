import * as core from '@actions/core'
import * as fs from 'fs/promises'
import * as os from 'os'
import * as path from 'path'
import { restoreCache } from './run'

const main = async (): Promise<void> => {
  await restoreCache({
    path: core.getInput('path', { required: true }),
    fromTags: core.getMultilineInput('from-tags', { required: true }),
    toTags: core.getMultilineInput('to-tags', { required: true }),
    contextDir: await fs.mkdtemp(path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'context-')),
  })
}

main().catch((e: Error) => {
  core.setFailed(e)
  console.error(e)
})
