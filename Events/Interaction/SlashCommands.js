const { ChatInputCommandInteraction, EmbedBuilder, Client } = require('discord.js')

const BlackListGuild = require('../../Structures/Schemas/BlacklistGuild')
const BlackListUser = require('../../Structures/Schemas/BlacklistUser')
const MaintenanceDB = require('../../Structures/Schemas/MaintenanceDB.js')

module.exports = {
    name: 'interactionCreate',
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return

        const Maintenance = MaintenanceDB.findOne({ ClientId: client.user.id })

        const GuildData = await BlackListGuild.findOne({
            Guild: interaction.guild.id
        }).catch((err) => {})
        const UserData = await BlackListUser.findOne({
            User: interaction.user.id
        }).catch((err) => {})

        const Embed = new EmbedBuilder()
            .setColor('Red')
            .setThumbnail(interaction.guild.iconURL())
            .setTimestamp()

        const command = client.commands.get(interaction.commandName)

        if (!command)
            return await interaction.reply({
                content: `<:warning_908958943466893323:1201844340276862976> | 這項指令過期或不存在了!`,
                ephemeral: true
            })

        if (command.developer && interaction.user.id !== '538639229220028416')
            return await interaction.reply({
                content: `<:warning_908958943466893323:1201844340276862976> | 這項指令僅限於開發人員使用!`,
                ephemeral: true
            })

        if (Maintenance.Maintenance) {
            return await interaction.reply({
                embeds: [
                    Embed.setTitle(`<:discordstaff:1094236985318707221> | 維護模式`)
                        .setDescription(
                            `${client.user.username} 正在進行維修，暫無法使用任何功能\n原因： ${Maintenance.Description}`
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
        if (GuildData)
            return interaction.reply({
                embeds: [
                    Embed.setTitle(`該伺服器為黑名單伺服器!`).setDescription(
                        `<:outage_868122243845206087:1202112862990897172> | 您的伺服器已被列入黑名單，自從<t:${parseInt(
                            GuildData.Time / 1000
                        )}:R>, 原因為: **${GuildData.Reason}**`
                    )
                ]
            })

        if (UserData)
            return interaction.reply({
                embeds: [
                    Embed.setTitle(`該用戶為黑名單用戶!`).setDescription(
                        `<:outage_868122243845206087:1202112862990897172> | 您已被列入黑名單，自從<t:${parseInt(
                            UserData.Time / 1000
                        )}:R>, 原因為: **${UserData.Reason}**`
                    )
                ]
            })

        const subCommand = interaction.options.getSubcommand(false)
        if (subCommand) {
            const subCommandFile = client.subCommands.get(
                `${interaction.commandName}.${subCommand}`
            )
            if (!subCommandFile)
                return interaction.reply({
                    content:
                        '<:warning_908958943466893323:1201844340276862976> | 這項指令過期或不存在了!',
                    ephemeral: true
                })
            subCommandFile.execute(interaction, client)
        } else command.execute(interaction, client)
    }
}
