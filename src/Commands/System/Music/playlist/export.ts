import emojis from '@/libs/emoji/emoji.js'
import Playlist from '@/Structures/Schemas/Playlist.js'
import {
    AttachmentBuilder,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandBuilder
} from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('playlist-export')
        .setNameLocalization('zh-TW', '播放清單-匯出')
        .setNameLocalization('ja', 'プレイリストをエクスポート')
        .setDescription('Export your playlist')
        .setDescriptionLocalization('zh-TW', '匯出你的播放清單')
        .setDescriptionLocalization('ja', 'プレイリストをエクスポートします')
        .addStringOption((opt) =>
            opt
                .setName('playlist')
                .setNameLocalization('zh-TW', '播放清單')
                .setNameLocalization('ja', 'プレイリスト')
                .setDescription('Choose a playlist to export')
                .setDescriptionLocalization('zh-TW', '選擇要匯出的播放清單')
                .setDescriptionLocalization('ja', 'エクスポートするプレイリストを選択してください')
                .setRequired(true)
                .setAutocomplete(true)
        ),
    async autocomplete(interaction: AutocompleteInteraction) {
        const focusedValue = interaction.options.getFocused()
        const playlists = (await Playlist.find({
            userId: interaction.user.id
        }).select('name')) as Array<{
            name: string
        }>

        const filtered = playlists
            .filter((p) => p.name.toLowerCase().includes(focusedValue.toLowerCase()))
            .map((p) => ({ name: p.name, value: p.name }))
            .slice(0, 25)

        await interaction.respond(filtered)
    },
    async execute(interaction: ChatInputCommandInteraction) {
        const playlistName = interaction.options.getString('playlist')

        try {
            const playlist = (await Playlist.findOne({
                userId: interaction.user.id,
                name: playlistName
            })) as {
                name: string
                description: string
                songs: any[]
            }

            if (!playlist) {
                return await interaction.reply({
                    content: `${emojis.outage} | 找不到指定的播放清單`,
                    flags: MessageFlags.Ephemeral
                })
            }

            // 建立匯出資料
            const exportData = {
                name: playlist.name,
                description: playlist.description,
                songs: playlist.songs.map((song) => ({
                    title: song.title,
                    url: song.url
                }))
            }

            // 建立檔案
            const attachment = new AttachmentBuilder(
                Buffer.from(JSON.stringify(exportData, null, 2))
            ).setName(`playlist-${playlist.name}.json`)

            await interaction.reply({
                content: `${emojis.correct} | 這是你的播放清單 **${playlist.name}**`,
                files: [attachment],
                flags: MessageFlags.Ephemeral
            })
        } catch (error) {
            console.error('匯出播放清單時發生錯誤:', error)
            await interaction.reply({
                content: `${emojis.outage} | 匯出播放清單時發生錯誤`,
                flags: MessageFlags.Ephemeral
            })
        }
    }
}
