import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { loadFiles } from '@/Structures/Functions/fileLoader.js'
import type { ApplicationCommand, ApplicationCommandData } from 'discord.js'
import { ContextMenuCommandBuilder } from 'discord.js'
import path from 'node:path'
import { Logger } from '@/libs/utils/logger.js'

interface CommandStatus {
    Command: string
    Status: string
    Error?: string
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
                        Logger.error(`文件 ${fileName} 沒有正確export default`)
                        commands.push({
                            Command: fileName,
                            Status: '❌',
                            Error: '未export default'
                        })
                        continue
                    }
                } catch (importError: any) {
                    const fileName = path.basename(file)
                    Logger.error(`導入文件 ${fileName} 時出錯:`, importError.stack)
                    commands.push({
                        Command: fileName,
                        Status: '❌',
                        Error:
                            importError instanceof Error ? importError.message : String(importError)
                    })
                    continue
                }

                if (!command.subCommandGroup && !command.subCommand && !command.data) {
                    const fileName = path.basename(file)
                    Logger.warn(`警告: 在 ${fileName} 中未找到指令數據`)
                    commands.push({
                        Command: fileName,
                        Status: '⚠️',
                        Error: '缺少 data 屬性'
                    })
                    continue
                }

                // <command>.<sub>
                if (command.subCommand) {
                    client.subCommands.set(command.subCommand, command)
                    commands.push({ Command: `[SUB] ${command.subCommand}`, Status: '✅' })
                    continue
                }

                // <command>.<group>.<sub>
                if (command.subCommandGroup) {
                    const key = command.subCommandGroup as string
                    client.subCommands.set(key, command)
                    commands.push({ Command: `[SUBG] ${key}`, Status: '✅' })
                    continue
                }

                // context menu
                if (command.data instanceof ContextMenuCommandBuilder) {
                    client.contextMenus.set(command.data.name, command)
                    commandsArray.push(command.data.toJSON())
                    commands.push({ Command: `[CM] ${command.data.name}`, Status: '✅' })
                    continue
                }

                const commandPath = file.replace(/\\\\/g, '/')
                const commandLocation = commandPath.split('/Commands/')[1]?.split('/') ?? []
                const rootCategory = commandLocation[0]
                const nestedCategory = commandLocation[1]

                if (rootCategory === 'General' || rootCategory === 'System' && nestedCategory === 'AFK') {
                    command.helpCategory = 'General'
                } else if (rootCategory === 'Mod') {
                    command.helpCategory = 'Moderation'
                } else if (rootCategory === 'Fun') {
                    command.helpCategory = 'Fun'
                } else if (rootCategory === 'System' && nestedCategory === 'Music') {
                    command.helpCategory = 'Music'
                } else if (rootCategory === 'System' && nestedCategory === 'Giveaway') {
                    command.helpCategory = 'Giveaway'
                }

                client.commands.set(command.data.name, command)
                commandsArray.push(command.data)
                commands.push({ Command: command.data.name, Status: '✅' })
            } catch (fileError) {
                const fileName = path.basename(file)
                Logger.error(`處理文件 ${fileName} 時出錯:`, fileError)
                commands.push({
                    Command: fileName,
                    Status: '❌',
                    Error: fileError instanceof Error ? fileError.message : String(fileError)
                })
            }
        }

        Logger.info(
            `成功載入 ${client.commands.size} 個指令、${client.subCommands.size} 個子指令、${client.contextMenus.size} 個右鍵菜單`
        )

        if (client.application) {
            try {
                await client.application.commands.set(commandsArray)
                Logger.info(`成功向 Discord API 註冊 ${commandsArray.length} 個命令`)
            } catch (apiError) {
                Logger.error('向 Discord API 註冊命令時發生錯誤:', apiError)
            }
        } else {
            Logger.warn('警告: 無法設置應用程式指令，因為 client.application 未定義')
        }

        console.table(commands, ['Command', 'Status', 'Error'])
        console.info('\n\x1b[36m%s\x1b[0m', '>>> Commands Loaded')
    } catch (error) {
        Logger.error('載入指令時發生錯誤:', error)
        throw error
    } finally {
        console.timeEnd('Commands Loaded')
    }
}
