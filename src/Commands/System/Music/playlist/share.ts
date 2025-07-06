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
        .setName('playlist-share')
        .setNameLocalization('zh-TW', '播放清單-分享')
        .setNameLocalization('ja', 'プレイリスト共有')
        .setDescription('Share your playlist')
        .setDescriptionLocalization('zh-TW', '分享你的播放清單')
        .setDescriptionLocalization('ja', 'プレイリストを共有する')
        .addStringOption((opt) =>
            opt
                .setName('playlist')
                .setNameLocalization('zh-TW', '播放清單')
                .setNameLocalization('ja', 'プレイリスト')
                .setDescription('Choose a playlist to share')
                .setDescriptionLocalization('zh-TW', '選擇要分享的播放清單')
                .setDescriptionLocalization('ja', '共有するプレイリストを選択')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addBooleanOption((opt) =>
            opt
                .setName('private')
                .setNameLocalization('zh-TW', '私人')
                .setNameLocalization('ja', '非公開')
                .setDescription('Keep playlist private')
                .setDescriptionLocalization('zh-TW', '保持播放清單為私人')
                .setDescriptionLocalization('ja', 'プレイリストを非公開にする')
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
        const keepPrivate = interaction.options.getBoolean('private') ?? false

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

            playlist.isPrivate = keepPrivate
            await playlist.save()

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`<:share:1342805139513282650> 分享播放清單：${playlist.name}`)
                .setDescription(playlist.description || '沒有描述')
                .addFields(
                    {
                        name: '<:person:1265561455529562154> 建立者',
                        value: interaction.user.tag,
                        inline: true
                    },
                    {
                        name: '<:music:1265561113039208512>歌曲數',
                        value: playlist.songs.length.toString(),
                        inline: true
                    },
                    {
                        name: '<:lock:1342806678072197141> 私人播放清單',
                        value: keepPrivate ? '是' : '否',
                        inline: true
                    },
                    {
                        name: '<:id:1265560530462969978> 播放清單ID',
                        value: `${interaction.user.id}:${playlist.name}`,
                        inline: true
                    }
                )
                .setFooter({
                    text: '請複製播放清單ID並貼在來播放這個播放清單'
                })

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(`playlist-import:${playlist._id}`)
                    .setLabel('匯入到我的播放清單')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('<:download:1320298270739791973>'),
                new ButtonBuilder()
                    .setCustomId(`playlist-play:${interaction.user.id}:${playlist.name}`)
                    .setLabel('播放全部')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('<:play:1265561505458294826>')
            )

            await interaction.reply({
                content: keepPrivate
                    ? `${emojis.correct} | 已將播放清單設為${keepPrivate ? '<:lock:1342806678072197141> 私人' : '<:people:1265561435220611196> 公開'}`
                    : `${emojis.correct} | 分享播放清單成功！其他人現在可以播放這個播放清單了`,
                embeds: [embed],
                components: keepPrivate ? [] : [row]
            })
        } catch (error) {
            console.error('分享播放清單時發生錯誤:', error)
            await interaction.reply({
                content: `${emojis.outage} | 分享播放清單時發生錯誤`,
                flags: MessageFlags.Ephemeral
            })
        }
    }
}
