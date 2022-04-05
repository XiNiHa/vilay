import { join, extname, dirname } from 'node:path'
import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import glob from 'glob'
import swc from '@swc/core'

const outDir = 'dist'
const targets = ['cli.ts', 'plugin.ts', 'server/**/*']

if (existsSync(outDir)) await rm(outDir, { recursive: true })
if (!existsSync(outDir)) await mkdir(outDir)

const files = await Promise.all(
  targets.map(
    (target) =>
      new Promise<string[]>((resolve, reject) =>
        glob(target, (err, files) => (err ? reject(err) : resolve(files)))
      )
  )
)

await Promise.all(
  files.flatMap((files) =>
    files.map(async (file) => {
      const input = await readFile(file, 'utf-8')
      const { code } = await swc.transform(input, {
        jsc: { parser: { syntax: 'typescript' }, target: 'es2020' },
      })
      const ext = extname(file)
      const outPath = join(outDir, file.slice(0, file.lastIndexOf(ext)) + '.js')
      if (!existsSync(outPath))
        await mkdir(dirname(outPath), { recursive: true }).catch(() => {
          /* */
        })
      await writeFile(outPath, code, { encoding: 'utf-8' })
    })
  )
)
