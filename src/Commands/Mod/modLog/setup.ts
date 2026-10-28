import GuildConfig from '@/Structures/Schemas/GuildConfig.js'
import { sendModeratorLog } from '@/Systems/ModeratorLog.js'
import type { SubCommandType } from '@/typings/command.js'
import {
    ChannelType,
    ChatInputCommandInteraction,
    MessageFlags,
    PermissionFlagsBits,
    TextChannel
} from 'discord.js'

export default {
    subCommand: 'mod-log.setup',
    async execute(interaction: ChatInputCommandInteraction) {
        const guild = interaction.guild
        if (!guild) {
            return interaction.reply({
                content: '此指令只能在伺服器中使用。',
                flags: MessageFlags.Ephemeral
            })
        }

        const channel = interaction.options.getChannel('channel', true) as TextChannel
        if (channel.type !== ChannelType.GuildText) {
            return interaction.reply({
                content: '請選擇一般文字頻道。',
                flags: MessageFlags.Ephemeral
            })
        }

        const botMember = guild.members.me
        const permissions = botMember ? channel.permissionsFor(botMember) : null
        if (
            !permissions?.has([
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.EmbedLinks
            ])
        ) {
            return interaction.reply({
                content: 'Paper 需要該頻道的「查看頻道」、「傳送訊息」與「嵌入連結」權限。',
                flags: MessageFlags.Ephemeral
            })
        }

        await GuildConfig.findOneAndUpdate(
            { guildId: guild.id },
            { $set: { moderatorLogChannel: channel.id }, $setOnInsert: { disabledCommands: [] } },
            { upsert: true, setDefaultsOnInsert: true }
        )

        await sendModeratorLog(interaction, {
            action: '設定管理日誌頻道',
            details: [`日誌頻道：<#${channel.id}>`]
        })

        await (channel as TextChannel).send({
            embeds: [
                {
                    color: 0xa3a3a3,
                    title: 'Paper · 管理日誌已啟用',
                    description: '成功設定管理操作紀錄頻道。後續支援的管理操作將記錄於此。',
                    timestamp: new Date().toISOString()
                }
            ]
        })

        return interaction.reply({
            content: `管理日誌已設定為 <#${channel.id}>。`,
            flags: MessageFlags.Ephemeral
        })
    }
} as SubCommandType
