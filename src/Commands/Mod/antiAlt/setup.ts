import { emojis } from '@/libs/utils'
import DB from '@/Structures/Schemas/AntiAlt.js'
import type { SubCommandType } from '@/typings/command.js'
import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags, TextChannel } from 'discord.js'

export default {
    subCommand: 'anti-alt.setup',
    async execute(interaction: ChatInputCommandInteraction) {
        const options = interaction.options
        const { guild } = interaction

        const LogsChannel = options.getChannel('channel')

        await DB.findOneAndUpdate(
            { GuildID: guild!.id },
            { LogsChannel: LogsChannel!.id },
            {
                new: true,
                upsert: true
            }
        ).catch((err) => console.log(err))

        const LogsSetup = new EmbedBuilder()
            .setDescription(`${emojis.correct} | 成功設定日誌`)
            .setColor('#43b581')

        await (guild!.channels.cache.get(LogsChannel!.id)! as TextChannel)
            .send({ embeds: [LogsSetup] })
            .then(async (m) => {
                await interaction.reply({
                    content: `${emojis.correct} | 完成!`,
                    flags: MessageFlags.Ephemeral
                })
                setTimeout(() => {
                    m.delete()
                }, 10 * 1000)
            })
            .catch(() => {
                return interaction.reply({
                    content: `${emojis.warning} | 無法設定日誌頻道，請檢察機器人的權限!`,
                    flags: MessageFlags.Ephemeral
                })
            })
    }
} as SubCommandType
