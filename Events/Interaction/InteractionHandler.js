const {
    Client,
    Interaction,
    EmbedBuilder,
    ModalSubmitInteraction,
    ButtonInteraction,
    ChatInputCommandInteraction,
    StringSelectMenuInteraction,
    UserSelectMenuInteraction,
    RoleSelectMenuInteraction,
    ChannelSelectMenuInteraction,
    MentionableSelectMenuInteraction,
    ContextMenuInteraction,
    AutocompleteInteraction
} = require('discord.js')

const BlackListGuild = require('../../Structures/Schemas/BlacklistGuild')
const BlackListUser = require('../../Structures/Schemas/BlacklistUser')
const MaintenanceDB = require('../../Structures/Schemas/MaintenanceDB')

module.exports = {
    name: 'interactionCreate',
    /**
     * @param {Interaction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        try {
            // 檢查黑名單和維護模式
            if (interaction.guild) {
                const [mDB, GuildData, UserData] = await Promise.all([
                    MaintenanceDB.findOne({ ClientId: client.user.id }),
                    BlackListGuild.findOne({ Guild: interaction.guild.id }),
                    BlackListUser.findOne({ User: interaction.user.id })
                ])

                if (mDB?.Maintenance === 'True') {
                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(`<:discordstaff:1094236985318707221> | 維護模式`)
                                .setDescription(
                                    `${client.user.username} 正在進行維修，暫無法使用任何功能\n原因： ${mDB.Description}`
                                )
                                .setFooter({
                                    text: '造成不便，敬請見諒',
                                    iconURL: client.user.avatarURL()
                                })
                                .setAuthor({
                                    name: interaction.user.username,
                                    iconURL: interaction.user.avatarURL()
                                })
                                .setTimestamp()
                                .setColor('Blurple')
                        ]
                    })
                }

                if (GuildData || UserData) {
                    const data = GuildData || UserData
                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Red')
                                .setThumbnail(interaction.guild.iconURL())
                                .setTitle(
                                    `該${GuildData ? '伺服器' : '用戶'}為黑名單${GuildData ? '伺服器' : '用戶'}!`
                                )
                                .setDescription(
                                    `<:outage:1265561329528471613> | 您${GuildData ? '的伺服器' : ''}已被列入黑名單，自從<t:${parseInt(
                                        data.Time / 1000
                                    )}:R>, 原因為: **${data.Reason}**`
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
        } catch (error) {
            console.error(`[Interaction Error]: ${error}`)
            try {
                await interaction.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(
                                '<:outage:1265561329528471613> | 發生未知錯誤，請協助回報!'
                            )
                    ],
                    ephemeral: true
                })
            } catch {}
        }
    }
}

// 各種互動處理函數
/**
 *
 * @param {ChatInputCommandInteraction} interaction
 * @param {Client} client
 */
async function handleSlashCommand(interaction, client) {
    const command = client.commands.get(interaction.commandName)
    if (!command) {
        return await interaction.reply({
            content: `<:warning:1265562532857380936> | 這項指令過期或不存在了!`,
            ephemeral: true
        })
    }

    if (command.developer && interaction.user.id !== '538639229220028416') {
        return await interaction.reply({
            content: `<:warning:1265562532857380936> | 這項指令僅限於開發人員使用!`,
            ephemeral: true
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
                ephemeral: true
            })
        }
        await subCommandFile.execute(interaction, client)
    } else {
        await command.execute(interaction, client)
    }
}

/**
 *
 * @param {ButtonInteraction} interaction
 * @param {Client} client
 * @returns
 */
async function handleButton(interaction, client) {
    if (interaction.customId.startsWith('mcstats')) return
    if (interaction.customId.startsWith('report')) return
    if (interaction.customId.startsWith('rps_')) return
    if (interaction.customId.startsWith('approve_')) return
    if (interaction.customId.startsWith('unban')) return
    if (interaction.customId.startsWith('TicTacToe_')) return

    const buttonCustomId = interaction.customId.split('/')
    const Button = await client.buttons.get(buttonCustomId[0])

    if (!Button) {
        return await interaction.reply({
            content: '<:warning:1265562532857380936> | 這個按鈕不存在或過期了!',
            ephemeral: true
        })
    }

    if (Button.permission && !interaction.member.permissions.has(Button.permission)) {
        return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setDescription('<:warning:1265562532857380936> | 你沒有權限使用!')
            ],
            ephemeral: true
        })
    }

    await Button.execute(interaction, client, buttonCustomId.slice(1, -1))
}

/**
 *
 * @param {ModalSubmitInteraction} interaction
 * @param {Client} client
 */
async function handleModal(interaction, client) {
    const CustomId = interaction.customId.split('/')
    const Modal = await client.modals.get(CustomId[0])

    if (!Modal) {
        return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setDescription('<:outage:1265561329528471613> | 找不到該Modal')
            ],
            ephemeral: true
        })
    }

    if (Modal.permission && !interaction.member.permissions.has(Modal.permission)) {
        return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setDescription('<:warning:1265562532857380936> | 你沒有權限使用!')
            ],
            ephemeral: true
        })
    }

    let dev
    if (Modal.developers === true) dev = interaction.user.id !== '538639229220028416'
    if (dev) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Blue')
                    .setDescription('<:warning:1265562532857380936> | 這項Modal僅限於開發人員使用!')
            ],
            ephemeral: true
        })
    }

    await Modal.execute(interaction, client, CustomId.slice(1, -1))
}

/**
 *
 * @param {StringSelectMenuInteraction | UserSelectMenuInteraction | RoleSelectMenuInteraction | ChannelSelectMenuInteraction | MentionableSelectMenuInteraction} interaction
 * @param {Client} client
 */
async function handleSelectMenu(interaction, client) {
    const CustomId = interaction.customId.split('/')
    const Menu = await client.selectMenus.get(CustomId[0])

    if (!Menu) {
        return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setDescription('<:outage:1265561329528471613> | 找不到該下拉選單')
            ],
            ephemeral: true
        })
    }

    await Menu.execute(interaction, client, CustomId.slice(1, -1))
}

/**
 *
 * @param {ContextMenuInteraction} interaction
 * @param {Client} client
 */
async function handleContextMenu(interaction, client) {
    const menu = client.contextMenus.get(interaction.commandName)

    if (!menu) {
        return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setDescription('<:outage:1265561329528471613> | 找不到該右鍵選單')
            ],
            ephemeral: true
        })
    }

    if (menu.permission && !interaction.member.permissions.has(menu.permission)) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setDescription('<:warning:1265562532857380936> | 你沒有權限使用!')
            ],
            ephemeral: true
        })
    }

    await menu.execute(interaction, client)
}

/**
 *
 * @param {AutocompleteInteraction} interaction
 * @param {Client} client
 */
async function handleAutocomplete(interaction, client) {
    const command = await client.commands.get(interaction.commandName)

    if (!command) {
        return console.log(`[Autocomplete] 找不到指令 ${interaction.commandName}`)
    }

    if (command.autocomplete) {
        try {
            await command.autocomplete(interaction, client)
        } catch (error) {
            console.log('[Autocomplete] ' + error)
        }
    } else {
        console.warn(`[Autocomplete] 指令 ${interaction.commandName} 沒有實現 autocomplete 方法。`)
    }
}
