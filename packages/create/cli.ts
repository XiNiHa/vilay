#! /usr/bin/env node

import { argv, exit } from 'node:process'
import { resolve, isAbsolute } from 'node:path'
import { existsSync } from 'node:fs'
import { stat, readdir } from 'node:fs/promises'
import { homedir } from 'node:os'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import inquirer from 'inquirer'
import fetch from 'node-fetch'
import gunzip from 'gunzip-maybe'
import tar from 'tar-fs'
import { error, good, magenta, warn } from './colors.js'

const tarballRoot = 'https://api.github.com/repos/XiNiHa/vilay/tarball'
const templateDirectory = 'packages/create/templates'
const templates = ['typescript']

yargs(hideBin(argv))
  .command(
    ['new [projectPath]', '<projectPath>', "$0"],
    'create a new project',
    (yargs) =>
      yargs
        .positional('projectPath', {
          describe: 'The directory to create the project in.',
          type: 'string',
        })
        .option('template', {
          describe: 'Template to use for creating new project',
          type: 'string',
        }),
    async ({ projectPath, template }) => {
      console.log(magenta('*** create-vilay ***'))
      const projectDir = projectPath
        ? resolve(projectPath)
        : await inquirer
            .prompt<{ dir: string }>([
              {
                name: 'dir',
                type: 'input',
                message: 'Where would you like to create your app?',
                default: './vilay-app',
              },
            ])
            .then(async ({ dir }) => {
              const inputDir = dir.startsWith('~')
                ? dir.replace('~', homedir())
                : dir
              return isAbsolute(inputDir) ? inputDir : resolve(inputDir)
            })
            .catch((err) => {
              if (err.isTtyError) {
                console.error(
                  error(
                    'Please retry with a project directory specified as a command argument.'
                  )
                )
                exit(1)
              } else throw err
            })

      if (!projectDir) {
        console.error(error('Please provide a valid project path.'))
        exit(1)
      }

      if (
        existsSync(projectDir) &&
        (await stat(projectDir)).isDirectory() &&
        (await readdir(projectDir)).length > 0
      ) {
        console.error(
          error(
            'The project directory is not empty. Clear the directory or choose a different one.'
          )
        )
        exit(1)
      }

      const templateSelected =
        template ||
        (await inquirer
          .prompt<{ template: string }>([
            {
              name: 'template',
              type: 'list',
              message: 'Choose the template to use for the new project.',
              choices: templates,
            },
          ])
          .then(({ template }) => template)
          .catch((err) => {
            if (err.isTtyError) {
              console.warn(
                warn(
                  `Your terminal doesn't support interactivity, using default configurations...`
                )
              )
              return templates[0]
            } else throw error
          }))

      if (!templates.includes(templateSelected)) {
        console.error(
          error('Unknown template name! Please retry with existing templates.')
        )
        exit(1)
      }

      const response = await fetch(tarballRoot)
      if (response.status !== 200) {
        console.error(
          error(
            `There was a problem fetching the template from GitHub. The request responded with a ${response.status} status. Please try again later.`
          )
        )
        exit(1)
      } else if (!response.body) {
        console.error(
          error(
            `There was a problem fetching the template from GitHub. Response body is empty!`
          )
        )
        exit(1)
      }

      const p = promisify(pipeline)

      try {
        let hasOne = false
        await p(
          response.body.pipe(gunzip()),
          tar.extract(projectDir, {
            map(header) {
              const originalDirName = header.name.split('/')[0]
              header.name = header.name.replace(`${originalDirName}/`, '')

              const filePath = `${templateDirectory}/${templateSelected}/`
              if (header.name.startsWith(filePath)) {
                hasOne = true
                header.name = header.name.replace(filePath, '')
              } else {
                header.name = '__IGNORE__'
              }

              return header
            },
            ignore(_filename, header) {
              if (!header) {
                throw new Error(`Header is undefined`)
              }

              return header.name === '__IGNORE__'
            },
          })
        )

        if (!hasOne) {
          console.error(
            error(
              `The repository doesn't contain template files for the template "${templateSelected}". Please report this issue.`
            )
          )
          exit(1)
        }
      } catch (_) {
        console.error(
          error(`Error occured while extracting the template at "${projectDir}"`)
        )
        exit(1)
      }

      console.log(good(`Project successfully created at "${projectDir}"!`))
    }
  )
  .parse()
