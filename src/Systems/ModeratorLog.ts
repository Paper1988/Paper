import GuildConfig from '@/Structures/Schemas/GuildConfig.js'
import type { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js'
import { EmbedBuilder, TextChannel } from 'discord.js'

type ModeratorInteraction = ChatInputCommandInteraction | ButtonInteraction

export interface ModeratorLogEntry {
    action: string
    target?: string
    reason?: string
    details?: string[]
}

/**
 * Send a best-effort audit entry to the guild's configured moderator log channel.
 * Logging failures must never interrupt the moderation action itself.
 */
export async function sendModeratorLog(
    interaction: ModeratorInteraction,
    entry: ModeratorLogEntry
): Promise<void> {
    const guild = interaction.guild
    if (!guild) return

    try {
        const config = await GuildConfig.findOne({ guildId: guild.id })
            .select('moderatorLogChannel')
            .lean()
        if (!config?.moderatorLogChannel) return

        const channel = await guild.channels.fetch(config.moderatorLogChannel).catch(() => null)
        if (!channel?.isTextBased() || channel.isDMBased()) return

        const commandName = interaction.isChatInputCommand()
            ? `/${interaction.commandName}`
            : '/unban'

        const embed = new EmbedBuilder()
            .setColor(0xA3A3A3)
            .setTitle(entry.action.slice(0, 256))
            .addFields(
                { name: '執行者', value: `${interaction.user} (\`${interaction.user.id}\`)`, inline: true },
                { name: '指令', value: commandName, inline: true },
                { name: '頻道', value: interaction.channel ? `<#${interaction.channel.id}>` : '未知', inline: true }
            )
            .setTimestamp()

        if (entry.target) {
            embed.addFields({ name: '目標', value: entry.target.slice(0, 1024), inline: false })
        }
        if (entry.reason) {
            embed.addFields({ name: '原因', value: entry.reason.slice(0, 1024), inline: false })
        }
        if (entry.details?.length) {
            embed.addFields({
                name: '詳細資訊',
                value: entry.details.join('\n').slice(0, 1024),
                inline: false
            })
        }

        await (channel as TextChannel).send({ embeds: [embed] })
    } catch (error) {
        console.error('[ModeratorLog] Failed to send audit log:', error)
    }
}
