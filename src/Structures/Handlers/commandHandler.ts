import type { PaperClient } from '@/classes/PaperClient'
import type { CommandType } from '@/typings/command'
import chalk from 'chalk'
import type { ApplicationCommandData } from 'discord.js'
import { Collection, ContextMenuCommandBuilder } from 'discord.js'
import { loadFiles } from '../Functions/fileLoader'

interface Command {
    data: ApplicationCommandData | ContextMenuCommandBuilder
    subCommand?: boolean
    execute?: (...args: any[]) => Promise<void>
}

interface CommandStatus {
    Command: string
    Status: string
}

declare module 'discord.js' {
    interface Client {
        commands: Collection<string, CommandType>
        contextMenus: Collection<string, CommandType>
        subCommands: Collection<string, Command>
    }
}

export async function loadCommands(client: PaperClient): Promise<void> {
    console.time('Commands Loaded')
    const commands: CommandStatus[] = []

    // 清除現有的指令集合
    client.commands.clear()
    client.subCommands.clear()
    client.contextMenus.clear()

    const commandsArray: ApplicationCommandData[] = []

    try {
        const files = await loadFiles('Commands')

        for (const file of files) {
            const command = (await import(file)).default

            if (!command.subCommand && !command.data) {
                console.warn(`警告: 在 ${file} 中未找到指令數據`)
                continue
            }

            if (command.subCommand) {
                client.subCommands.set(command.subCommand, command)
                continue
            }

            if (command.data instanceof ContextMenuCommandBuilder) {
                client.contextMenus.set(command.data.name, command)
                commandsArray.push(command.data.toJSON())
                commands.push({ Command: `[CM] ${command.data.name}`, Status: '✅' })
                continue
            }

            client.commands.set(command.data.name, command)
            commandsArray.push(command.data)
            commands.push({ Command: command.data.name, Status: '✅' })
        }

        if (client.application) {
            await client.application.commands.set(commandsArray)
        } else {
            console.warn(chalk.yellow('警告: 無法設置應用程式指令，因為 client.application 未定義'))
        }

        console.table(commands, ['Command', 'Status'])
        console.info('\n\x1b[36m%s\x1b[0m', '指令載入完成')
    } catch (error) {
        console.error('載入指令時發生錯誤:', error)
        throw error
    } finally {
        console.timeEnd('Commands Loaded')
    }
}
