import { type ExtensionContext } from 'vscode'
import { logger } from '../lib'
import { exec } from 'child_process'
import { promisify } from 'util'
import * as path from 'path'

const execAsync = promisify(exec)

export async function runTests(context: ExtensionContext): Promise<void> {
  try {
    // Get the workspace root path
    const workspaceRoot = context.extensionPath
    const testsDir = path.join(workspaceRoot, '..', 'tests')

    logger.log('Running tests...')
    logger.log(`Tests directory: ${testsDir}`)

    // Change to tests directory and run tests
    const { stdout, stderr } = await execAsync('npm test', { cwd: testsDir })

    if (stderr) {
      logger.error(`Test errors: ${stderr}`)
    }

    // Log test results
    logger.log('Test Results:')
    logger.log(stdout)

    // Check if tests passed
    if (stdout.includes('passing')) {
      logger.success('All tests passed!')
    } else {
      logger.error('Some tests failed. Check the output for details.')
    }
  } catch (error) {
    logger.error(`Failed to run tests: ${error}`)
  }
} 
