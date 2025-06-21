import {
    AutocompleteInteraction,
    ButtonInteraction,
    ChannelSelectMenuInteraction,
    ChatInputCommandInteraction,
    MentionableSelectMenuInteraction,
    RoleSelectMenuInteraction,
    StringSelectMenuInteraction,
    UserSelectMenuInteraction,
    type Interaction
} from 'discord.js'

import type { PaperClient } from '@/classes/PaperClient.js'
import {
    checkBlacklist,
    CONFIG,
    handleInteractionError,
    interactionUtils
} from '@/libs/utils/index.js'
import type { EventType } from '@/typings/event'

export default {
    name: 'interactionCreate',
    async execute(client: PaperClient, interaction: Interaction) {
        if (!client) return

        try {
            if (await checkBlacklist(interaction)) {
                return
            }

            if (interaction.isChatInputCommand()) {
                return await handleSlashCommand(interaction, client)
            }

            if (interaction.isButton()) {
                return await handleButton(interaction, client)
            }

            if (interaction.isModalSubmit()) {
                return await handleModal(interaction, client)
            }

            if (
                interaction.isStringSelectMenu() ||
                interaction.isUserSelectMenu() ||
                interaction.isRoleSelectMenu() ||
                interaction.isChannelSelectMenu() ||
                interaction.isMentionableSelectMenu()
            ) {
                return await handleSelectMenu(interaction, client)
            }

            if (interaction.isContextMenuCommand()) {
                return await handleContextMenu(interaction, client)
            }

            if (interaction.isAutocomplete()) {
                return await handleAutocomplete(interaction, client)
            }
        } catch (error) {
            await handleInteractionError(error, interaction)
        }
    }
} satisfies EventType

async function handleSlashCommand(interaction: ChatInputCommandInteraction, client: PaperClient) {
    const command = client.commands.get(interaction.commandName)
    if (!command) {
        return await interactionUtils.sendErrorResponse(
            interaction,
            CONFIG.MESSAGES.COMMAND_NOT_FOUND
        )
    }

    // 檢查開發者權限
    if (command.developer && !interactionUtils.isDeveloper(interaction.user.id)) {
        return await interactionUtils.sendDeveloperError(interaction)
    }

    const subCommand = interaction.options.getSubcommand(false)
    if (subCommand) {
        const subCommandFile = await client.subCommands.get(
            `${interaction.commandName}.${subCommand}`
        )
        if (!subCommandFile) {
            return await interactionUtils.sendErrorResponse(
                interaction,
                CONFIG.MESSAGES.COMMAND_NOT_FOUND
            )
        }
        await subCommandFile.execute(interaction, client)
    } else {
        await command.execute(interaction, client)
    }
}

async function handleButton(interaction: ButtonInteraction, client: PaperClient) {
    if (CONFIG.BUTTON_PREFIXES.some((prefix) => interaction.customId.startsWith(prefix))) {
        return
    }

    const buttonCustomId = interactionUtils.parseCustomId(interaction.customId)
    const Button = client.buttons.get(buttonCustomId[0]!)

    if (!Button) {
        return await interactionUtils.sendErrorResponse(
            interaction,
            CONFIG.MESSAGES.BUTTON_NOT_FOUND
        )
    }

    await Button.execute(interaction, client, buttonCustomId.slice(1, -1))
}

async function handleModal(interaction: any, client: PaperClient) {
    const CustomId = interactionUtils.parseCustomId(interaction.customId)
    const Modal = client.modals.get(CustomId[0]!)

    if (!Modal) {
        return await interactionUtils.sendErrorResponse(
            interaction,
            CONFIG.MESSAGES.MODAL_NOT_FOUND
        )
    }

    if (Modal.developer && !interactionUtils.isDeveloper(interaction.user.id)) {
        return await interactionUtils.sendDeveloperError(interaction)
    }

    await Modal.execute(interaction, client, CustomId.slice(1, -1))
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
    const CustomId = interactionUtils.parseCustomId(interaction.customId)
    const Menu = client.selectMenus.get(CustomId[0]!)

    if (!Menu) {
        return await interactionUtils.sendErrorResponse(interaction, CONFIG.MESSAGES.MENU_NOT_FOUND)
    }

    await Menu.execute(interaction, client, CustomId.slice(1, -1))
}

async function handleContextMenu(interaction: any, client: PaperClient) {
    const menu = client.contextMenus.get(interaction.commandName)

    if (!menu) {
        return await interactionUtils.sendErrorResponse(
            interaction,
            CONFIG.MESSAGES.CONTEXT_MENU_NOT_FOUND
        )
    }

    await menu.execute(interaction, client)
}

async function handleAutocomplete(interaction: AutocompleteInteraction, client: PaperClient) {
    const command = client.commands.get(interaction.commandName)

    if (!command) {
        console.log(`[Autocomplete] 找不到指令 ${interaction.commandName}`)
        return
    }

    if (command.autocomplete) {
        try {
            await command.autocomplete(interaction, client)
        } catch (error) {
            console.error('[Autocomplete Error]:', error)
        }
    } else {
        console.warn(`[Autocomplete] 指令 ${interaction.commandName} 沒有實現 autocomplete 方法。`)
    }
}
