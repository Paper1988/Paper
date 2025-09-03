import Playlist from '@/Structures/Schemas/Playlist.js'
import emojis from '@/libs/emoji/emoji.js'
import {
    ActionRowBuilder,
    AutocompleteInteraction,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandBuilder
} from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('playlist-delete')
        .setNameLocalization('zh-TW', '播放清單-刪除')
        .setNameLocalization('ja', 'プレイリストを削除')
        .setDescription('Delete a playlist')
        .setDescriptionLocalization('zh-TW', '刪除指定的播放清單')
        .setDescriptionLocalization('ja', '指定したプレイリストを削除します')
        .addStringOption((opt) =>
            opt
                .setName('playlist')
                .setNameLocalization('zh-TW', '播放清單')
                .setNameLocalization('ja', 'プレイリスト')
                .setDescription('Choose a playlist to delete')
                .setDescriptionLocalization('zh-TW', '選擇要刪除的播放清單')
                .setDescriptionLocalization('ja', '削除するプレイリストを選択してください')
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

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(`playlist-delete:${playlistName}:confirm`)
                    .setLabel('確認刪除')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('<:delete:1265560264061882471>'),
                new ButtonBuilder()
                    .setCustomId(`playlist-delete:${playlistName}:cancel`)
                    .setLabel('取消')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('<:xmark:1265562550947545089>')
            )

            await interaction.reply({
                content: `${emojis.warning} | 你確定要刪除播放清單 **${playlistName}** 嗎？\n此操作無法復原！`,
                components: [row],
                flags: MessageFlags.Ephemeral
            })
        } catch (error) {
            console.error('刪除播放清單時發生錯誤:', error)
            await interaction.reply({
                content: `${emojis.outage} | 刪除播放清單時發生錯誤`,
                flags: MessageFlags.Ephemeral
            })
        }
    }
}
