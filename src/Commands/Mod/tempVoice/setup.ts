import emojis from '@/libs/emoji/emoji.js'
import TempVoice from '@/Structures/Schemas/TempVoice.js'
import type { SubCommandType } from '@/typings/command.js'
import { ChannelType, ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits } from 'discord.js'

export default {
    subCommand: 'temp-voice.setup',
    async execute(interaction: ChatInputCommandInteraction) {
        const { options, guild } = interaction

        const me = guild!.members.me!
        if (
            !me.permissions.has([
                PermissionFlagsBits.ManageChannels,
                PermissionFlagsBits.MoveMembers,
                PermissionFlagsBits.ManageRoles
            ])
        ) {
            return await interaction.reply({
                content: `${emojis.warning} | Paper 需要「管理頻道」、「移動成員」和「管理身分組」權限!`,
                flags: MessageFlags.Ephemeral
            })
        }

        const nameTemplate = options.getString('name')
        const userLimit = options.getInteger('limit')

        // 已設定過且大廳還在：只更新名稱格式和人數上限，不重複建立頻道
        const existing = await TempVoice.findOne({ GuildID: guild!.id }).exec().catch(() => null)
        const existingLobby = existing ? guild!.channels.cache.get(existing.LobbyChannel) : null

        if (existing && existingLobby) {
            if (nameTemplate !== null) existing.NameTemplate = nameTemplate
            if (userLimit !== null) existing.UserLimit = userLimit
            await existing.save()

            return await interaction.reply({
                content: `${emojis.correct} | 已經設定過了，大廳在 ${existingLobby}，已更新設定`,
                flags: MessageFlags.Ephemeral
            })
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral })

        // 類別還在就沿用（例如只有大廳被刪掉），否則重新建立
        const existingCategory = existing?.CategoryID
            ? guild!.channels.cache.get(existing.CategoryID)
            : null

        const category =
            existingCategory?.type === ChannelType.GuildCategory
                ? existingCategory
                : await guild!.channels.create({
                      name: '臨時語音',
                      type: ChannelType. GuildCategory,
                      reason: `${interaction.user.tag} 設定臨時語音系統`
                  })

        const lobby = await guild!.channels.create({
            name: '➕ 建立語音頻道',
            type: ChannelType.GuildVoice,
            parent: category.id,
            reason: `${interaction.user.tag} 設定臨時語音系統`
        })

        await TempVoice.findOneAndUpdate(
            { GuildID: guild!.id },
            {
                LobbyChannel: lobby.id,
                CategoryID: category.id,
                ...(nameTemplate !== null && { NameTemplate: nameTemplate }),
                ...(userLimit !== null && { UserLimit: userLimit })
            },
            { upsert: true }
        ).catch((err) => console.log(err))

        return await interaction.editReply({
            content: `${emojis.correct} | 已建立 ${lobby}，成員加入後會自動建立專屬頻道。頻道和類別都可以自由改名或移動!`
        })
    }
} as SubCommandType
