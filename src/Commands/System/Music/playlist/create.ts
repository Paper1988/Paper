import Playlist from '@/Structures/Schemas/Playlist.js'
import emojis from '@/libs/emoji/emoji.js'
import type { CommandType } from '@/typings/command.js'
import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('playlist-create')
        .setNameLocalization('zh-TW', '播放清單-建立')
        .setNameLocalization('ja', 'プレイリストを作成')
        .setDescription('Create a new playlist')
        .setDescriptionLocalization('zh-TW', '建立新的播放清單')
        .setDescriptionLocalization('ja', '新しいプレイリストを作成します')
        .addStringOption((opt) =>
            opt
                .setName('name')
                .setNameLocalization('zh-TW', '名稱')
                .setNameLocalization('ja', '名前')
                .setDescription('Playlist name')
                .setDescriptionLocalization('zh-TW', '播放清單名稱')
                .setDescriptionLocalization('ja', 'プレイリストの名前')
                .setRequired(true)
                .setMaxLength(32)
        )
        .addStringOption((opt) =>
            opt
                .setName('description')
                .setNameLocalization('zh-TW', '描述')
                .setNameLocalization('ja', '説明')
                .setDescription('Playlist description')
                .setDescriptionLocalization('zh-TW', '播放清單描述')
                .setDescriptionLocalization('ja', 'プレイリストの説明')
                .setMaxLength(100)
        )
        .addBooleanOption((opt) =>
            opt
                .setName('private')
                .setNameLocalization('zh-TW', '私人')
                .setNameLocalization('ja', '非公開')
                .setDescription('Set as private playlist')
                .setDescriptionLocalization('zh-TW', '設為私人播放清單')
                .setDescriptionLocalization('ja', '非公開のプレイリストに設定する')
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const name = interaction.options.getString('name')
        const description = interaction.options.getString('description')
        const isPrivate = interaction.options.getBoolean('private') ?? true

        try {
            const existingPlaylist = await Playlist.findOne({
                userId: interaction.user.id,
                name: name
            })

            if (existingPlaylist) {
                return await interaction.reply({
                    content: `${emojis.warning} | 你已經有一個相同名稱的播放清單了`,
                    flags: MessageFlags.Ephemeral
                })
            }

            await Playlist.create({
                userId: interaction.user.id,
                name,
                description,
                isPrivate,
                songs: []
            })

            await interaction.reply({
                content: `${emojis.correct} | 成功建立播放清單 **${name}**${description ? `\n<:richpresent:1265561713969987676> 描述：${description}` : ''}${isPrivate ? '\n<:lock:1342806678072197141> 這是一個私人播放清單' : ''}`,
                flags: MessageFlags.Ephemeral
            })
        } catch (error) {
            console.error('建立播放清單時發生錯誤:', error)
            await interaction.reply({
                content: `${emojis.outage} | 建立播放清單時發生錯誤`,
                flags: MessageFlags.Ephemeral
            })
        }
    }
} as CommandType
