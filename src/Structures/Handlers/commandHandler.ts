import type { PaperClient } from '@/classes/PaperClient.js'
import { loadFiles } from '@/Structures/Functions/fileLoader.js'
import type { CommandType } from '@/typings/command.js'
import chalk from 'chalk'
import type { ApplicationCommandData } from 'discord.js'
import { Collection, ContextMenuCommandBuilder } from 'discord.js'
import path from 'node:path'

interface Command {
    data: ApplicationCommandData | ContextMenuCommandBuilder
    subCommand?: boolean
    execute?: (...args: any[]) => Promise<void>
}

interface CommandStatus {
    Command: string
    Status: string
    Error?: string
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

    client.commands.clear()
    client.subCommands.clear()
    client.contextMenus.clear()

    const commandsArray: ApplicationCommandData[] = []

    try {
        const files = await loadFiles('Commands')

        for (const file of files) {
            try {
                let command
                try {
                    const importedModule = await import(file)
                    command = importedModule.default

                    if (!command) {
                        const fileName = path.basename(file)
                        console.error(`>>> ❌ 命令文件 ${fileName} 沒有正確導出 default`)
                        commands.push({
                            Command: fileName,
                            Status: '❌',
                            Error: '未導出 default'
                        })
                        continue
                    }
                } catch (importError) {
                    const fileName = path.basename(file)
                    console.error(`>>> ❌ 導入命令文件 ${fileName} 時出錯:`, importError)
                    commands.push({
                        Command: fileName,
                        Status: '❌',
                        Error:
                            importError instanceof Error ? importError.message : String(importError)
                    })
                    continue
                }

                if (!command.subCommand && !command.data) {
                    const fileName = path.basename(file)
                    console.warn(`>>> ⚠️ 警告: 在 ${fileName} 中未找到指令數據`)
                    commands.push({
                        Command: fileName,
                        Status: '⚠️',
                        Error: '缺少 data 屬性'
                    })
                    continue
                }

                if (command.subCommand) {
                    client.subCommands.set(command.subCommand, command)
                    commands.push({ Command: `[SUB] ${command.subCommand}`, Status: '✅' })
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
            } catch (fileError) {
                const fileName = path.basename(file)
                console.error(`>>> ❌ 處理命令文件 ${fileName} 時出錯:`, fileError)
                commands.push({
                    Command: fileName,
                    Status: '❌',
                    Error: fileError instanceof Error ? fileError.message : String(fileError)
                })
            }
        }

        console.log(
            `>>> 成功載入 ${client.commands.size} 個命令、${client.subCommands.size} 個子命令、${client.contextMenus.size} 個右鍵菜單`
        )

        if (client.application) {
            try {
                await client.application.commands.set(commandsArray)
                console.log(`>>> ✅ 成功向 Discord API 註冊 ${commandsArray.length} 個命令`)
            } catch (apiError) {
                console.error('>>> ❌ 向 Discord API 註冊命令時發生錯誤:', apiError)
            }
        } else {
            console.warn(
                chalk.yellow('>>> ⚠️ 警告: 無法設置應用程式指令，因為 client.application 未定義')
            )
        }

        console.table(commands, ['Command', 'Status', 'Error'])
        console.info('\n\x1b[36m%s\x1b[0m', '>>> Commands Loaded')
    } catch (error) {
        console.error('>>> ❌ 載入指令時發生錯誤:', error)
        throw error
    } finally {
        console.timeEnd('Commands Loaded')
    }
}
