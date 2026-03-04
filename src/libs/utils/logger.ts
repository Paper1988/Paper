import * as Sentry from '@sentry/node'
import chalk from 'chalk'

export class Logger {
    static info(message: string, ...args: any[]) {
        console.info(chalk.cyan('[INFO]', message, ...args))
    }

    static warn(message: string, ...args: any[]) {
        console.warn(chalk.yellow('[WARN]', message, ...args))
        Sentry.captureMessage(message, 'warning')
    }

    static error(error: Error | string, ...args: any[]) {
        if (error instanceof Error) {
            console.error(
                chalk.red(
                    '[ERROR]',
                    error.stack || error.message,
                    ...args
                )
            )
            Sentry.captureException(error)
        } else {
            console.error(chalk.red('[ERROR]', error, ...args))
            Sentry.captureMessage(error, 'error')
        }
    }

    static debug(message: string, ...args: any[]) {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(chalk.gray('[DEBUG]', message, ...args))
        }
    }
}
