import emojis from '@/libs/emoji/emoji'
import Playlist from '@/Structures/Schemas/Playlist'
import type { CommandType } from '@/typings/command'
import { YouTubePlugin } from '@distube/youtube'
import {
    ActionRowBuilder,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    type APISelectMenuOption
} from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('playlist-add')
        .setNameLocalization('zh-TW', '播放清單-加入')
        .setNameLocalization('ja', 'プレイリストに追加')
        .setDescription('Add a song to a playlist by searching')
        .setDescriptionLocalization('zh-TW', '透過搜尋將歌曲加入播放清單')
        .setDescriptionLocalization('ja', '検索してプレイリストに曲を追加します')
        .addStringOption((opt) =>
            opt
                .setName('playlist')
                .setNameLocalization('zh-TW', '播放清單')
                .setNameLocalization('ja', 'プレイリスト')
                .setDescription('Choose a playlist')
                .setDescriptionLocalization('zh-TW', '選擇播放清單')
                .setDescriptionLocalization('ja', 'プレイリストを選択してください')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption((opt) =>
            opt
                .setName('search')
                .setNameLocalization('zh-TW', '搜尋')
                .setNameLocalization('ja', '検索')
                .setDescription('Search for a song to add')
                .setDescriptionLocalization('zh-TW', '搜尋要加入的歌曲')
                .setDescriptionLocalization('ja', '追加する曲を検索してください')
                .setRequired(true)
        ),
    async autocomplete(interaction: AutocompleteInteraction) {
        const focusedValue = interaction.options.getFocused().trim()
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
        const searchQuery = interaction.options.getString('search')!

        try {
            const playlist = await Playlist.findOne({
                userId: interaction.user.id,
                name: playlistName
            })

            if (!playlist) {
                return await interaction.reply({
                    content: `${emojis.outage} | 找不到指定的播放清單`,
                    flags: MessageFlags.Ephemeral
                })
            }

            const yt = new YouTubePlugin()
            const results = await yt.search(searchQuery)

            if (results.length === 0) {
                return await interaction.reply({
                    content: `${emojis.warning} | 找不到任何符合的歌曲`,
                    flags: MessageFlags.Ephemeral
                })
            }

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(`playlist-add:${playlist.userId}:${playlist.name}`)
                .setPlaceholder('選擇歌曲')

            results.forEach((song) => {
                selectMenu.addOptions({
                    label: song.name!,
                    value: song.url
                } as APISelectMenuOption)
            })

            const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)

            await interaction.reply({
                content: '請選擇要添加的歌曲：',
                components: [row]
            })
        } catch (error) {
            console.error('搜尋歌曲時發生錯誤:', error)
            await interaction.reply({
                content: `${emojis.outage} | 搜尋歌曲時發生錯誤`,
                flags: MessageFlags.Ephemeral
            })
        }
    }
} as CommandType
