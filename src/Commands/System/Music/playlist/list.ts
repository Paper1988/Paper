import Playlist from '@/Structures/Schemas/Playlist.js'
import emojis from '@/libs/emoji/emoji.js'
import {
    ActionRowBuilder,
    AutocompleteInteraction,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    MessageFlags,
    SlashCommandBuilder
} from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('playlist-list')
        .setNameLocalization('zh-TW', '播放清單-列表')
        .setNameLocalization('ja', 'プレイリスト一覧')
        .setDescription('Show your playlists or view a specific playlist')
        .setDescriptionLocalization('zh-TW', '顯示你的播放清單或查看特定播放清單')
        .setDescriptionLocalization(
            'ja',
            'プレイリストを表示するか、特定のプレイリストを確認します'
        )
        .addStringOption((opt) =>
            opt
                .setName('playlist')
                .setNameLocalization('zh-TW', '播放清單')
                .setNameLocalization('ja', 'プレイリスト')
                .setDescription('Choose a playlist to view details')
                .setDescriptionLocalization('zh-TW', '選擇要查看的播放清單')
                .setDescriptionLocalization('ja', '詳細を確認するプレイリストを選択')
                .setAutocomplete(true)
        ),
    async autocomplete(interaction: AutocompleteInteraction) {
        const focusedValue = interaction.options.getFocused()
        const playlists = (await Playlist.find({
            $or: [{ userId: interaction.user.id }, { isPrivate: false }]
        }).select('name userId isPrivate')) as Array<{
            name: string
            userId: string
            isPrivate: boolean
        }>

        const filtered: Array<{ name: string; value: string }> = playlists
            .map((p) => {
                const userId = p.userId === interaction.user.id ? ' (我的)' : ''
                const isPrivate = p.isPrivate ? ' 🔒' : ''

                const name = `${p.name}${userId}${isPrivate}`
                const value = `${p.userId}:${p.name}`

                return { name, value }
            })
            .filter((p) => p.name.toLowerCase().includes(focusedValue.toLowerCase()))
            .slice(0, 25)

        await interaction.respond(filtered)
    },
    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const playlistOption = interaction.options.getString('playlist')

            // 如果沒有指定播放清單，顯示用戶的所有播放清單
            if (!playlistOption) {
                const playlists = (await Playlist.find({
                    userId: interaction.user.id
                }).select('name songs isPrivate plays createdAt')) as Array<{
                    name: string
                    userId: string
                    isPrivate: boolean
                    createdAt: Date
                    songs: []
                    plays: number
                }>

                if (playlists.length === 0) {
                    return await interaction.reply({
                        content: `${emojis.warning} | 你還沒有建立任何播放清單`,
                        flags: MessageFlags.Ephemeral
                    })
                }

                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('<:todolist:1320296314071945267> 你的播放清單')
                    .setDescription(
                        playlists
                            .map(
                                (p) =>
                                    `${p.isPrivate ? '<:lock:1342806678072197141>' : '<:todolist:1320296314071945267>'} **${p.name}**\n` +
                                    `├ 歌曲數：${p.songs.length}\n` +
                                    `├ 播放次數：${p.plays}\n` +
                                    `└ 建立時間：<t:${Math.floor(p.createdAt.getTime() / 1000)}:R>`
                            )
                            .join('\n\n')
                    )
                    .setFooter({
                        text: `共 ${playlists.length} 個播放清單`
                    })

                return await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
            }

            // 查看特定播放清單
            const [userId, playlistName] = playlistOption.split(':')
            const playlist = await Playlist.findOne({
                userId: userId,
                name: playlistName
            })

            if (!playlist) {
                return await interaction.reply({
                    content: `${emojis.warning} | 找不到指定的播放清單`,
                    flags: MessageFlags.Ephemeral
                })
            }

            if (playlist.isPrivate && playlist.userId !== interaction.user.id) {
                return await interaction.reply({
                    content: `${emojis.warning} | 這是私人播放清單`,
                    flags: MessageFlags.Ephemeral
                })
            }

            // 分頁顯示歌曲
            const songsPerPage = 10
            const totalPages = Math.ceil(playlist.songs.length / songsPerPage)
            const page = 1

            const owner = await interaction.client.users.fetch(playlist.userId)
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`播放清單：${playlist.name}`)
                .setDescription(playlist.description || '沒有描述')
                .addFields(
                    {
                        name: '<:person:1265561455529562154> 建立者',
                        value: owner.tag,
                        inline: true
                    },
                    {
                        name: '<:music:1265561113039208512> 歌曲數',
                        value: playlist.songs.length.toString(),
                        inline: true
                    },
                    {
                        name: '<:play:1265561505458294826> 播放次數',
                        value: playlist.plays.toString(),
                        inline: true
                    }
                )

            if (playlist.songs.length > 0) {
                const startIdx = (page - 1) * songsPerPage
                const endIdx = Math.min(startIdx + songsPerPage, playlist.songs.length)

                embed
                    .addFields({
                        name: '<:richpresent:1265561713969987676> 歌曲列表',
                        value: (
                            playlist.songs as Array<{
                                title: string
                                url: string
                                duration: number
                            }>
                        )
                            .slice(startIdx, endIdx)
                            .map(
                                (song, index) =>
                                    `${startIdx + index + 1}. [${song.title}](${song.url}) (${Math.floor(
                                        song.duration / 60
                                    )}:${(song.duration % 60).toString().padStart(2, '0')})`
                            )
                            .join('\n')
                    })
                    .setFooter({
                        text: `第 ${page}/${totalPages} 頁 • 建立於 ${playlist.createdAt.toLocaleDateString()}`
                    })
            }

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(`playlist-page:${playlist.userId}:${playlist.name}:prev:${page}`)
                    .setLabel('上一頁')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === 1),
                new ButtonBuilder()
                    .setCustomId(`playlist-page:${playlist.userId}:${playlist.name}:next:${page}`)
                    .setLabel('下一頁')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === totalPages),
                new ButtonBuilder()
                    .setCustomId(`playlist-play:${playlist.userId}:${playlist.name}`)
                    .setLabel('播放全部')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('<:play:1265561505458294826>')
            )

            await interaction.reply({
                embeds: [embed],
                components: playlist.songs.length > 0 ? [row] : [],
                flags: MessageFlags.Ephemeral
            })
        } catch (error) {
            console.error('顯示播放清單時發生錯誤:', error)
            await interaction.reply({
                content: `${emojis.outage} | 顯示播放清單時發生錯誤`,
                flags: MessageFlags.Ephemeral
            })
        }
    }
}
