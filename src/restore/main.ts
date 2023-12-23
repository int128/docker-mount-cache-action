import * as core from '@actions/core'
import { run } from './run'

const main = async (): Promise<void> => {
  await run({
    path: core.getInput('path', { required: true }),
    tags: core.getInput('tags', { required: true }),
  })
}

main().catch((e: Error) => {
  core.setFailed(e)
  console.error(e)
})
