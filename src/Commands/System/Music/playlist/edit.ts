import Playlist from '@/Structures/Schemas/Playlist.js'
import emojis from '@/libs/emoji/emoji.js'
import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandBuilder
} from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('playlist-edit')
        .setNameLocalization('zh-TW', '播放清單-編輯')
        .setNameLocalization('ja', 'プレイリストを編集')
        .setDescription('Edit playlist information')
        .setDescriptionLocalization('zh-TW', '編輯播放清單資訊')
        .setDescriptionLocalization('ja', 'プレイリストの情報を編集します')
        .addStringOption((opt) =>
            opt
                .setName('playlist')
                .setNameLocalization('zh-TW', '播放清單')
                .setNameLocalization('ja', 'プレイリスト')
                .setDescription('Choose a playlist to edit')
                .setDescriptionLocalization('zh-TW', '選擇要編輯的播放清單')
                .setDescriptionLocalization('ja', '編集するプレイリストを選択してください')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption((opt) =>
            opt
                .setName('name')
                .setNameLocalization('zh-TW', '新名稱')
                .setNameLocalization('ja', '新しい名前')
                .setDescription('New name for the playlist')
                .setDescriptionLocalization('zh-TW', '播放清單的新名稱')
                .setDescriptionLocalization('ja', 'プレイリストの新しい名前')
                .setMaxLength(32)
        )
        .addStringOption((opt) =>
            opt
                .setName('description')
                .setNameLocalization('zh-TW', '描述')
                .setNameLocalization('ja', '説明')
                .setDescription('New description for the playlist')
                .setDescriptionLocalization('zh-TW', '播放清單的新描述')
                .setDescriptionLocalization('ja', 'プレイリストの新しい説明')
                .setMaxLength(100)
        )
        .addBooleanOption((opt) =>
            opt
                .setName('private')
                .setNameLocalization('zh-TW', '私人')
                .setNameLocalization('ja', '非公開')
                .setDescription('Set playlist privacy')
                .setDescriptionLocalization('zh-TW', '設定播放清單隱私')
                .setDescriptionLocalization('ja', 'プレイリストの公開設定を変更します')
        ),
    async autocomplete(interaction: AutocompleteInteraction) {
        const focusedValue = interaction.options.getFocused()
        const playlists = await Playlist.find({
            userId: interaction.user.id
        }).select('name')

        const filtered = playlists
            .filter((p) => p.name.toLowerCase().includes(focusedValue.toLowerCase()))
            .map((p) => ({ name: p.name, value: p.name }))
            .slice(0, 25)

        await interaction.respond(filtered)
    },
    async execute(interaction: ChatInputCommandInteraction) {
        const playlistName = interaction.options.getString('playlist')
        const newName = interaction.options.getString('name')
        const newDescription = interaction.options.getString('description')
        const newPrivacy = interaction.options.getBoolean('private')

        if (!newName && newDescription === null && newPrivacy === null) {
            return await interaction.reply({
                content: `${emojis.warning} | 請至少提供一個要修改的項目`,
                flags: MessageFlags.Ephemeral
            })
        }

        try {
            const playlist = await Playlist.findOne({
                userId: interaction.user.id,
                name: playlistName
            })

            if (!playlist) {
                return await interaction.reply({
                    content: `${emojis.warning} | 找不到指定的播放清單`,
                    flags: MessageFlags.Ephemeral
                })
            }

            // 檢查新名稱是否已存在
            if (newName && newName !== playlistName) {
                const existingPlaylist = await Playlist.findOne({
                    userId: interaction.user.id,
                    name: newName
                })

                if (existingPlaylist) {
                    return await interaction.reply({
                        content: `${emojis.outage} | 你已經有一個名為 **${newName}** 的播放清單了`,
                        flags: MessageFlags.Ephemeral
                    })
                }
            }

            // 更新資訊
            if (newName) playlist.name = newName
            if (newDescription !== null) playlist.description = newDescription
            if (newPrivacy !== null) playlist.isPrivate = newPrivacy

            await playlist.save()

            await interaction.reply({
                content:
                    `${emojis.correct} | 已更新播放清單資訊：\n` +
                    `${newName ? `<:todolist:1320296314071945267> 名稱：**${newName}**\n` : ''}` +
                    `${newDescription !== null ? `<:richpresent:1265561713969987676> 描述：${newDescription || '(無)'}\n` : ''}` +
                    `${newPrivacy !== null ? `<:lock:1342806678072197141> 私人：${newPrivacy ? '是' : '否'}` : ''}`,
                flags: MessageFlags.Ephemeral
            })
        } catch (error) {
            console.error('編輯播放清單時發生錯誤:', error)
            await interaction.reply({
                content: `${emojis.outage} | 編輯播放清單時發生錯誤`,
                flags: MessageFlags.Ephemeral
            })
        }
    }
}
