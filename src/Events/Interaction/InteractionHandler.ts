import {
    AutocompleteInteraction,
    ButtonInteraction,
    ChannelSelectMenuInteraction,
    ChatInputCommandInteraction,
    Client,
    ContextMenuCommandInteraction,
    EmbedBuilder,
    type Interaction,
    MentionableSelectMenuInteraction,
    MessageFlags,
    ModalSubmitInteraction,
    RoleSelectMenuInteraction,
    StringSelectMenuInteraction,
    TextChannel,
    UserSelectMenuInteraction
} from 'discord.js'

import type { PaperClient } from '@/classes/PaperClient'
import BlackListGuild from '../../Structures/Schemas/BlacklistGuild'
import BlackListUser from '../../Structures/Schemas/BlacklistUser'
import { deleteMessageAfter } from '../../Systems/Music'

export default {
    name: 'interactionCreate',
    async execute(interaction: Interaction, client: PaperClient) {
        try {
            // 檢查黑名單和維護模式
            if (interaction.guild) {
                const [GuildData, UserData] = await Promise.all([
                    BlackListGuild.findOne({ Guild: interaction.guild.id }),
                    BlackListUser.findOne({ User: interaction.user.id })
                ])

                if (GuildData || UserData) {
                    const data = GuildData || UserData
                    return await (interaction as ChatInputCommandInteraction).reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Red')
                                .setThumbnail(interaction.guild.iconURL())
                                .setTitle(
                                    `該${GuildData ? '伺服器' : '用戶'}為黑名單${GuildData ? '伺服器' : '用戶'}!`
                                )
                                .setDescription(
                                    `<:outage:1265561329528471613> | 您${GuildData ? '的伺服器' : ''}已被列入黑名單，自從<t:${Math.floor(data?.Time! / 1000)}:R>, 原因為: **${data!.Reason}**`
                                )
                                .setTimestamp()
                        ]
                    })
                }
            }

            // 處理不同類型的互動
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
        } catch (error: any) {
            console.error(`[Interaction Error]: ${error.stack || error}`)
            if (String(error).includes('DiscordAPIError[10062]: Unknown interaction')) {
                await interaction.user.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setTitle('發生錯誤')
                            .setDescription(
                                '<:outage:1265561329528471613> | 訊息被流量怪獸吃掉了，請稍後再試~'
                            )
                    ]
                })
            } else {
                try {
                    await (interaction.channel! as TextChannel)
                        .send({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Red')
                                    .setDescription(
                                        '<:outage:1265561329528471613> | 發生未知錯誤，請協助回報!'
                                    )
                            ]
                        })
                        .then((msg) => deleteMessageAfter(msg, 30 * 1000))
                } catch {}
            }
        }
    }
}

async function handleSlashCommand(interaction: ChatInputCommandInteraction, client: PaperClient) {
    const command = client.commands.get(interaction.commandName)
    if (!command) {
        return await interaction.reply({
            content: `<:warning:1265562532857380936> | 這項指令過期或不存在了!`,
            flags: MessageFlags.Ephemeral
        })
    }

    if (command.developer && interaction.user.id !== '538639229220028416') {
        return await interaction.reply({
            content: `<:warning:1265562532857380936> | 這項指令僅限於開發人員使用!`,
            flags: MessageFlags.Ephemeral
        })
    }

    const subCommand = interaction.options.getSubcommand(false)
    if (subCommand) {
        const subCommandFile = await client.subCommands.get(
            `${interaction.commandName}.${subCommand}`
        )
        if (!subCommandFile) {
            return await interaction.reply({
                content: '<:warning:1265562532857380936> | 這項指令過期或不存在了!',
                flags: MessageFlags.Ephemeral
            })
        }
        await subCommandFile.execute(interaction, client)
    } else {
        await command.execute(interaction, client)
    }
}

async function handleButton(interaction: ButtonInteraction, client: PaperClient) {
    if (interaction.customId.startsWith('mcstats')) return
    if (interaction.customId.startsWith('report')) return
    if (interaction.customId.startsWith('rps_')) return
    if (interaction.customId.startsWith('approve_')) return
    if (interaction.customId.startsWith('unban')) return
    if (interaction.customId.startsWith('TicTacToe_')) return

    const buttonCustomId = interaction.customId.includes('/')
        ? interaction.customId.split('/')
        : interaction.customId.split(':')

    const Button = await client.buttons.get(buttonCustomId[0]!)

    if (!Button) {
        return await interaction.reply({
            content: '<:warning:1265562532857380936> | 這個按鈕不存在或過期了!',
            flags: MessageFlags.Ephemeral
        })
    }

    if (Button.permission && !interaction.memberPermissions!.has(Button.permission)) {
        return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setDescription('<:warning:1265562532857380936> | 你沒有權限使用!')
            ],
            flags: MessageFlags.Ephemeral
        })
    }

    await Button.execute(interaction, client)
}

async function handleModal(interaction: ModalSubmitInteraction, client: PaperClient) {
    const CustomId = interaction.customId.includes('/')
        ? interaction.customId.split('/')
        : interaction.customId.split(':')
    const Modal = await client.modals.get(CustomId[0]!)

    if (!Modal) {
        return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setDescription('<:outage:1265561329528471613> | 找不到該Modal')
            ],
            flags: MessageFlags.Ephemeral
        })
    }

    if (Modal.permission && !interaction.memberPermissions!.has(Modal.permission)) {
        return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setDescription('<:warning:1265562532857380936> | 你沒有權限使用!')
            ],
            flags: MessageFlags.Ephemeral
        })
    }

    let dev: boolean = false
    if (Modal.developers === true) dev = interaction.user.id !== '538639229220028416'
    if (dev) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Blue')
                    .setDescription('<:warning:1265562532857380936> | 這項Modal僅限於開發人員使用!')
            ],
            flags: MessageFlags.Ephemeral
        })
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
    const CustomId = interaction.customId.includes('/')
        ? interaction.customId.split('/')
        : interaction.customId.split(':')
    const Menu = await client.selectMenus.get(CustomId[0]!)

    if (!Menu) {
        return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setDescription('<:outage:1265561329528471613> | 找不到該下拉選單')
            ],
            flags: MessageFlags.Ephemeral
        })
    }

    await Menu.execute(interaction, client, CustomId.slice(1, -1))
}

async function handleContextMenu(interaction: ContextMenuCommandInteraction, client: PaperClient) {
    const menu = client.contextMenus.get(interaction.commandName)

    if (!menu) {
        return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setDescription('<:outage:1265561329528471613> | 找不到該右鍵選單')
            ],
            flags: MessageFlags.Ephemeral
        })
    }

    if (menu.permission && !interaction.memberPermissions!.has(menu.permission)) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setDescription('<:warning:1265562532857380936> | 你沒有權限使用!')
            ],
            flags: MessageFlags.Ephemeral
        })
    }

    await menu.execute(interaction, client)
}

async function handleAutocomplete(interaction: AutocompleteInteraction, client: PaperClient) {
    const command = client.commands.get(interaction.commandName)

    if (!command) {
        return console.log(`[Autocomplete] 找不到指令 ${interaction.commandName}`)
    }

    if (command.autocomplete) {
        try {
            await command.autocomplete(interaction, client)
        } catch (error) {
            console.log('[Autocomplete] ' + error)
        }
    } else if (!command.autocomplete) {
        console.warn(`[Autocomplete] 指令 ${interaction.commandName} 沒有實現 autocomplete 方法。`)
        return
    }
}
