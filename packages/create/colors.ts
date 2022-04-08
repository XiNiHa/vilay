import { env } from 'node:process'
import chalk, { supportsColor } from 'chalk'

export const useColor = supportsColor && !env.NO_COLOR

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const K = (x: any) => x

export const magenta = supportsColor ? chalk.magenta : K

export const error = supportsColor ? chalk.red : K
export const warn = supportsColor ? chalk.yellow : K
export const good = supportsColor ? chalk.green : K
