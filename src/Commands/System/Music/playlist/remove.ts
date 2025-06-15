import Playlist from '@/Structures/Schemas/Playlist'
import emojis from '@/libs/emoji/emoji'
import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandBuilder
} from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('playlist-remove')
        .setNameLocalization('zh-TW', '播放清單-移除歌曲')
        .setNameLocalization('ja', '曲を削除')
        .setDescription('Remove a song from playlist')
        .setDescriptionLocalization('zh-TW', '從播放清單中移除歌曲')
        .setDescriptionLocalization('ja', 'プレイリストから曲を削除する')
        .addStringOption((opt) =>
            opt
                .setName('playlist')
                .setNameLocalization('zh-TW', '播放清單')
                .setNameLocalization('ja', 'プレイリスト')
                .setDescription('Choose a playlist')
                .setDescriptionLocalization('zh-TW', '選擇播放清單')
                .setDescriptionLocalization('ja', 'プレイリストを選択')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addIntegerOption((opt) =>
            opt
                .setName('position')
                .setNameLocalization('zh-TW', '位置')
                .setNameLocalization('ja', '位置')
                .setDescription('Song position in playlist (1-based)')
                .setDescriptionLocalization('zh-TW', '歌曲在播放清單中的位置 (從1開始)')
                .setDescriptionLocalization('ja', 'プレイリスト内の曲の位置（1から始まる）')
                .setRequired(true)
                .setMinValue(1)
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
        const position = interaction.options.getInteger('position')!

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

            if (position > playlist.songs.length) {
                return await interaction.reply({
                    content: `${emojis.warning} | 播放清單中沒有第 ${position} 首歌`,
                    flags: MessageFlags.Ephemeral
                })
            }

            const removedSong = playlist.songs.splice(position - 1, 1)[0]!
            await playlist.save()

            await interaction.reply({
                content: `${emojis.correct} | 已從播放清單 **${playlistName}** 中移除歌曲 **${removedSong.title}**`,
                flags: MessageFlags.Ephemeral
            })
        } catch (error) {
            console.error('移除歌曲時發生錯誤:', error)
            await interaction.reply({
                content: `${emojis.outage} | 移除歌曲時發生錯誤`,
                flags: MessageFlags.Ephemeral
            })
        }
    }
}
