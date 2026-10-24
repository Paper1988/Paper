import {
    AutocompleteInteraction,
    ButtonInteraction,
    ChannelSelectMenuInteraction,
    ChatInputCommandInteraction,
    MentionableSelectMenuInteraction,
    MessageContextMenuCommandInteraction,
    ModalSubmitInteraction,
    RoleSelectMenuInteraction,
    StringSelectMenuInteraction,
    UserContextMenuCommandInteraction,
    UserSelectMenuInteraction,
    type Interaction
} from 'discord.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import {
    checkBlacklist,
    CONFIG,
    handleInteractionError,
    interactionUtils
} from '@/libs/utils/index.js'
import { Logger } from '@/libs/utils/logger.js'
import type { EventType } from '@/typings/event.js'
import CommandUsage from '@/Structures/Schemas/commandUsage.js'
import GuildConfig from '@/Structures/Schemas/GuildConfig.js'
import { MessageFlags } from 'discord.js'

// ─── Constants ────────────────────────────────────────────────────────────────

const COOLDOWN_MS = 2000
const cooldownMap = new Map<string, number>()

// ─── Event ────────────────────────────────────────────────────────────────────

export default {
    name: 'interactionCreate',
    async execute(client: PaperClient, interaction: Interaction) {
        try {
            if (await checkBlacklist(interaction)) return

            if (interaction.isChatInputCommand()) return await handleSlashCommand(interaction, client)
            if (interaction.isButton()) return await handleButton(interaction, client)
            if (interaction.isModalSubmit()) return await handleModal(interaction, client)
            if (
                interaction.isStringSelectMenu() ||
                interaction.isUserSelectMenu() ||
                interaction.isRoleSelectMenu() ||
                interaction.isChannelSelectMenu() ||
                interaction.isMentionableSelectMenu()
            ) return await handleSelectMenu(interaction, client)
            if (interaction.isContextMenuCommand()) return await handleContextMenu(interaction, client)
            if (interaction.isAutocomplete()) return await handleAutocomplete(interaction, client)
        } catch (error) {
            await handleInteractionError(error, interaction)
        }
    }
} satisfies EventType

// ─── Usage Recording ──────────────────────────────────────────────────────────

async function recordUsage(interaction: ChatInputCommandInteraction) {
    try {
        await CommandUsage.create({
            userId: interaction.user.id,
            command: interaction.commandName,
            timestamp: new Date()
        })
    } catch (err) {
        Logger.error('儲存指令使用紀錄失敗:', err)
    }
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

async function handleSlashCommand(interaction: ChatInputCommandInteraction, client: PaperClient) {
    const command = client.commands.get(interaction.commandName)
    if (!command) {
        return interactionUtils.sendErrorResponse(interaction, CONFIG.MESSAGES.COMMAND_NOT_FOUND)
    }

    if (interaction.guildId) {
        try {
            const guildConfig = await GuildConfig.findOne({ guildId: interaction.guildId }).lean()
            if (guildConfig?.disabledCommands.includes(interaction.commandName)) {
                return interaction.reply({
                    content: '此伺服器已停用此指令。',
                    flags: MessageFlags.Ephemeral
                })
            }
        } catch (error) {
            Logger.error('讀取伺服器指令設定失敗:', error)
            return interactionUtils.sendErrorResponse(interaction, '讀取伺服器設定失敗，請稍後再試。')
        }
    }

    // 開發者專屬指令驗證
    if (command.developer && !interactionUtils.isDeveloper(interaction.user.id)) {
        return interactionUtils.sendDeveloperError(interaction)
    }

    // Cooldown 處理：
    // - developer 指令在 cooldown 中直接跳過執行
    // - 一般指令在 cooldown 中仍會執行，但跳過 usage 記錄
    const key = `${interaction.user.id}-${interaction.commandName}`
    const now = Date.now()
    const lastTime = cooldownMap.get(key)
    const isOnCooldown = lastTime !== undefined && now - lastTime < COOLDOWN_MS

    if (isOnCooldown) {
        if (command.developer) return
    } else {
        cooldownMap.set(key, now)
        // 自動清除過期條目，防止 cooldownMap 無限增長
        setTimeout(() => cooldownMap.delete(key), COOLDOWN_MS)
        void recordUsage(interaction)
    }

    const subCommandGroup = interaction.options.getSubcommandGroup(false)
    const subCommand = interaction.options.getSubcommand(false)
    if (subCommand) {
        const key = subCommandGroup
            ? `${interaction.commandName}.${subCommandGroup}.${subCommand}`
            : `${interaction.commandName}.${subCommand}`
        const subCommandFile = client.subCommands.get(key)
        if (!subCommandFile) {
            return interactionUtils.sendErrorResponse(interaction, CONFIG.MESSAGES.COMMAND_NOT_FOUND)
        }
        await subCommandFile.execute(interaction, client)
    } else {
        await command.execute(interaction, client)
    }
}

async function handleButton(interaction: ButtonInteraction, client: PaperClient) {
    if (CONFIG.BUTTON_PREFIXES.some((prefix) => interaction.customId.startsWith(prefix))) return

    const [buttonId, ...args] = interactionUtils.parseCustomId(interaction.customId)
    const button = client.buttons.get(buttonId!)

    if (!button) {
        return interactionUtils.sendErrorResponse(interaction, CONFIG.MESSAGES.BUTTON_NOT_FOUND)
    }

    await button.execute(interaction, client, args)
}

async function handleModal(interaction: ModalSubmitInteraction, client: PaperClient) {
    const [modalId, ...args] = interactionUtils.parseCustomId(interaction.customId)
    const modal = client.modals.get(modalId!)

    if (!modal) {
        return interactionUtils.sendErrorResponse(interaction, CONFIG.MESSAGES.MODAL_NOT_FOUND)
    }

    if (modal.developer && !interactionUtils.isDeveloper(interaction.user.id)) {
        return interactionUtils.sendDeveloperError(interaction)
    }

    await modal.execute(interaction, client, args)
}

async function handleSelectMenu(
    interaction:
        | StringSelectMenuInteraction
        | UserSelectMenuInteraction
        | RoleSelectMenuInteraction
        | ChannelSelectMenuInteraction
        | MentionableSelectMenuInteraction,
    client: PaperClient
) {
    const [menuId, ...args] = interactionUtils.parseCustomId(interaction.customId)
    const menu = client.selectMenus.get(menuId!)

    if (!menu) {
        return interactionUtils.sendErrorResponse(interaction, CONFIG.MESSAGES.MENU_NOT_FOUND)
    }

    await menu.execute(interaction, client, args)
}

async function handleContextMenu(
    interaction: MessageContextMenuCommandInteraction | UserContextMenuCommandInteraction,
    client: PaperClient
) {
    const menu = client.contextMenus.get(interaction.commandName)

    if (!menu) {
        return interactionUtils.sendErrorResponse(interaction, CONFIG.MESSAGES.CONTEXT_MENU_NOT_FOUND)
    }

    await menu.execute(interaction, client)
}

async function handleAutocomplete(interaction: AutocompleteInteraction, client: PaperClient) {
    const command = client.commands.get(interaction.commandName)
    if (!command) {
        Logger.warn(`[Autocomplete] 找不到指令 ${interaction.commandName}`)
        return
    }

    if (!command.autocomplete) {
        Logger.warn(`[Autocomplete] 指令 ${interaction.commandName} 沒有實現 autocomplete 方法`)
        return
    }

    try {
        await command.autocomplete(interaction, client)
    } catch (error) {
        Logger.error('[Autocomplete Error]:', error)
    }
}
