import GuildConfig from '@/Structures/Schemas/GuildConfig.js'
import { sendModeratorLog } from '@/Systems/ModeratorLog.js'
import type { CommandType } from '@/typings/command.js'
import {
    ChannelType,
    ChatInputCommandInteraction,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
    TextChannel
} from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('mod-log')
        .setNameLocalization('zh-TW', '管理日誌')
        .setDescription('Configure the moderator audit log channel')
        .setDescriptionLocalization('zh-TW', '設定管理操作的紀錄頻道')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand((subcommand) =>
            subcommand
                .setName('setup')
                .setNameLocalization('zh-TW', '設定')
                .setDescription('Set the moderator log channel')
                .setDescriptionLocalization('zh-TW', '設定管理日誌頻道')
                .addChannelOption((option) =>
                    option
                        .setName('channel')
                        .setNameLocalization('zh-TW', '頻道')
                        .setDescription('Choose a text channel for moderation logs')
                        .setDescriptionLocalization('zh-TW', '選擇接收管理操作紀錄的文字頻道')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('reset')
                .setNameLocalization('zh-TW', '重設')
                .setDescription('Disable moderator logging')
                .setDescriptionLocalization('zh-TW', '停用管理操作紀錄')
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const guild = interaction.guild
        if (!guild) {
            return interaction.reply({
                content: '此指令只能在伺服器中使用。',
                flags: MessageFlags.Ephemeral
            })
        }

        if (interaction.options.getSubcommand() === 'setup') {
            const channel = interaction.options.getChannel('channel', true)
            if (channel.type !== ChannelType.GuildText) {
                return interaction.reply({
                    content: '請選擇一般文字頻道。',
                    flags: MessageFlags.Ephemeral
                })
            }

            const botMember = guild.members.me
            const permissions = botMember ? channel.permissionsFor(botMember) : null
            if (!permissions?.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks])) {
                return interaction.reply({
                    content: 'Paper 需要該頻道的「查看頻道」、「傳送訊息」與「嵌入連結」權限。',
                    flags: MessageFlags.Ephemeral
                })
            }

            await GuildConfig.findOneAndUpdate(
                { guildId: guild.id },
                { $set: { moderatorLogChannel: channel.id }, $setOnInsert: { disabledCommands: [] } },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            )

            await sendModeratorLog(interaction, {
                action: '設定管理日誌頻道',
                details: [`日誌頻道：<#${channel.id}>`]
            })

            await (channel as TextChannel).send({
                embeds: [{
                    color: 0xA3A3A3,
                    title: 'Paper · 管理日誌已啟用',
                    description: '成功設定管理操作紀錄頻道。後續支援的管理操作將記錄於此。',
                    timestamp: new Date().toISOString()
                }]
            })

            return interaction.reply({
                content: `管理日誌已設定為 <#${channel.id}>。`,
                flags: MessageFlags.Ephemeral
            })
        }

        await sendModeratorLog(interaction, { action: '停用管理日誌' })

        await GuildConfig.findOneAndUpdate(
            { guildId: guild.id },
            { $set: { moderatorLogChannel: null }, $setOnInsert: { disabledCommands: [] } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )

        return interaction.reply({
            content: '已停用管理日誌。',
            flags: MessageFlags.Ephemeral
        })
    }
} as CommandType
