import * as path from 'path'
import * as glob from 'glob'
const Mocha = require('mocha')

export function run(): Promise<void> {
  const testsRoot = path.resolve(__dirname, '..')

  return new Promise((resolve, reject) => {
    const mocha = new Mocha({
      ui: 'tdd',
      color: true
    })

    glob.glob('**/**.test.js', { cwd: testsRoot })
      .then((files: string[]) => {
        files.forEach((f: string) => mocha.addFile(path.resolve(testsRoot, f)))

        try {
          mocha.run((failures: number) => {
            if (failures > 0) {
              reject(new Error(`${failures} tests failed.`))
            } else {
              resolve()
            }
          })
        } catch (err) {
          reject(err)
        }
      })
      .catch((err: Error) => reject(err))
  })
} 