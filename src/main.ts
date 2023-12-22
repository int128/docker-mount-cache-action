import * as core from '@actions/core'
import { run } from './run'

const main = async (): Promise<void> => {
  await run({})
}

main().catch((e: Error) => {
  core.setFailed(e)
  console.error(e)
})
