import DB from '@/Structures/Schemas/AntiAlt.js'
import { sendModeratorLog } from '@/Systems/ModeratorLog.js'
import { deleteMessageAfter } from '@/Systems/Music.js'
import { emojis } from '@/libs/utils/index.js'
import type { SubCommandType } from '@/typings/command.js'
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js'

export default {
    subCommand: 'anti-alt.reset',
    async execute(interaction: ChatInputCommandInteraction) {
        const { guild } = interaction

        const LogsReset = new EmbedBuilder()
            .setDescription('<:correct:1265560254708711467> | 成功重置日誌頻道')
            .setColor('#43b581')

        try {
            const { deletedCount } = await DB.deleteMany({ GuildID: guild!.id }).exec()
            if (!deletedCount) {
                return interaction
                    .reply({
                        content: `${emojis.warning} | 無日誌頻道`
                    })
                    .then(deleteMessageAfter)
            }
            await sendModeratorLog(interaction, { action: '重設反小號日誌' })
            await interaction.reply({ embeds: [LogsReset] })
        } catch (err) {
            throw err
        }
    }
} as SubCommandType
