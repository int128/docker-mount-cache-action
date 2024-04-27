import * as core from '@actions/core'
import * as fs from 'fs/promises'
import * as os from 'os'
import * as path from 'path'
import { run } from './run.js'

const main = async (): Promise<void> => {
  await run({
    path: core.getInput('path', { required: true }),
    tags: core.getMultilineInput('tags', { required: true }),
    contextDir: await fs.mkdtemp(path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'context-')),
    internalMode: core.getInput('internal-mode', { required: true }),
  })
}

main().catch((e: Error) => {
  core.setFailed(e)
  console.error(e)
})
