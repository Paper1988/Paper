import * as Sentry from '@sentry/node'
import chalk from 'chalk'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

export class Logger {
    static info(message: string, ...args: any[]) {
        console.info(chalk.cyan('[INFO]', message, ...args))
    }

    static warn(message: string, ...args: any[]) {
        const __filename = fileURLToPath(import.meta.url)
        console.warn(chalk.yellow('[WARN]', chalk.magenta(`[${__filename}]`), message, ...args))
        Sentry.captureMessage(message, 'warning')
    }

    static error(error: Error | string, ...args: any[]) {
        if (error instanceof Error) {
            console.error(
                chalk.red(
                    '[ERROR]',
                    chalk.magenta(`[${__filename}]`),
                    error.stack || error.message,
                    ...args
                )
            )
            Sentry.captureException(error)
        } else {
            console.error(chalk.red('[ERROR]', chalk.magenta(`[${__filename}]`), error, ...args))
            Sentry.captureMessage(error, 'error')
        }
    }

    static debug(message: string, ...args: any[]) {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(chalk.gray('[DEBUG]', message, ...args))
        }
    }
}
