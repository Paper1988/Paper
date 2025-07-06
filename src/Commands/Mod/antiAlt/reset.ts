import DB from '@/Structures/Schemas/AntiAlt.js'
import type { SubCommandType } from '@/typings/command.js'
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js'
import { Error } from 'mongoose'

export default {
    subCommand: 'anti-alt.reset',
    async execute(interaction: ChatInputCommandInteraction) {
        const { guild } = interaction

        const LogsReset = new EmbedBuilder()
            .setDescription('<:correct:1265560254708711467> | 成功重置日誌頻道')
            .setColor('#43b581')

        DB.deleteMany({ GuildID: guild!.id }, async (err: Error, data: any) => {
            if (err) throw err
            if (!data) {
                return interaction.reply({
                    content: '<:warning:1265562532857380936> | 找不到數據'
                })
            }
            await interaction.reply({ embeds: [LogsReset] })
        })
    }
} as SubCommandType
