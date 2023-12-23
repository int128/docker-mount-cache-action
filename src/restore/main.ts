import * as core from '@actions/core'
import { run } from './run'

const main = async (): Promise<void> => {
  await run({
    path: core.getInput('path', { required: true }),
    key: core.getInput('key', { required: true }),
  })
}

main().catch((e: Error) => {
  core.setFailed(e)
  console.error(e)
})
