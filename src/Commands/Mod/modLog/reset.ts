import GuildConfig from '@/Structures/Schemas/GuildConfig.js'
import { sendModeratorLog } from '@/Systems/ModeratorLog.js'
import type { SubCommandType } from '@/typings/command.js'
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js'

export default {
    subCommand: 'mod-log.reset',
    async execute(interaction: ChatInputCommandInteraction) {
        const guild = interaction.guild
        if (!guild) {
            return interaction.reply({
                content: '此指令只能在伺服器中使用。',
                flags: MessageFlags.Ephemeral
            })
        }

        // 先記錄再停用，否則這筆紀錄送不出去
        await sendModeratorLog(interaction, { action: '停用管理日誌' })

        await GuildConfig.findOneAndUpdate(
            { guildId: guild.id },
            { $set: { moderatorLogChannel: null }, $setOnInsert: { disabledCommands: [] } },
            { upsert: true, setDefaultsOnInsert: true }
        )

        return interaction.reply({
            content: '已停用管理日誌。',
            flags: MessageFlags.Ephemeral
        })
    }
} as SubCommandType
