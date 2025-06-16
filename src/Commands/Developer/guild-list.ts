import type { CommandType } from '@/typings/command'
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    type MessageActionRowComponentBuilder,
    MessageFlags,
    SlashCommandBuilder
} from 'discord.js'

export default {
    developer: true,
    data: new SlashCommandBuilder()
        .setName('guildlist')
        .setDescription('顯示機器人的伺服器排行(僅限開發人員)'),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const guilds = client.guilds.cache.sort((a, b) => b.memberCount - a.memberCount).first(10)

        const description = guilds
            .map((guild, index) => {
                return `${index + 1}) ${
                    guild.name.length >= 20 ? `${guild.name.slice(0, 20)}...` : guild.name
                } -> ${guild.memberCount} 位成員`
            })
            .join('\n')

        const embed = new EmbedBuilder()
            .setTitle('伺服器排行')
            .setDescription(
                '順序 | 名稱 | 成員數\n' +
                    description +
                    `\n\n所有成員: ${client.guilds.cache.reduce(
                        (a, b) => a + b.memberCount,
                        0
                    )}\n所有伺服器: ${client.guilds.cache.size}`
            )
            .setColor('Aqua')

        const button = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('guildlist')
                .setStyle(ButtonStyle.Success)
                .setLabel('List')
                .setEmoji('📃')
        )

        await interaction.reply({
            embeds: [embed],
            components: [button],
            flags: MessageFlags.Ephemeral
        })
    }
} as CommandType
