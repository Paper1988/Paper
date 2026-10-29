import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { deleteMessageAfter, validateVoiceChannel } from '@/Systems/Music.js'
import emojis from '@/libs/emoji/emoji.js'
import type { ButtonType } from '@/typings/component.js'
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder,
    GuildMember,
    MessageFlags,
    TextChannel
} from 'discord.js'
import Genius from 'genius-lyrics'
import type { Player } from 'moonlink.js'

export default {
    id: 'lyrics',
    async execute(interaction: ButtonInteraction, client: PaperClient) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })
        const member = interaction.member! as GuildMember
        const voiceChannel = member.voice.channel

        if (!(await validateVoiceChannel(interaction, client, voiceChannel))) return

        const player = client.moonlink?.players.get(interaction.guildId!) as Player | undefined
        const track = player?.current

        if (!player || !track) {
            return await interaction
                .editReply({
                    content: `${emojis.warning} | 目前沒有正在播放的音樂!`
                })
                .then(deleteMessageAfter)
        }

        const channel = client.channels.cache.get(player.textChannelId)
        if (!channel || !(channel instanceof TextChannel)) {
            return interaction.editReply({
                content: `${emojis.warning} | 找不到播放器所在的文字頻道。`
            })
        }

        try {
            const genius = new Genius.Client()
            const songs = await genius.songs.search(track.title)
            const song = songs[0]

            if (!song) {
                return interaction.editReply({
                    content: `${emojis.warning} | 找不到「${track.title}」的歌詞。`
                })
            }

            const lyrics = await song.lyrics()
            if (!lyrics?.trim()) {
                return interaction.editReply({
                    content: `${emojis.warning} | 找不到「${track.title}」的歌詞。`
                })
            }

            // Keep only one lyrics message per player so repeated clicks do not flood the channel.
            const previousLyricsMessageId = player.data.musicLyricsMsgId as string | undefined
            if (previousLyricsMessageId) {
                try {
                    const previousMessage = await channel.messages.fetch(previousLyricsMessageId)
                    await previousMessage.delete()
                } catch {
                    // The previous lyrics message may already have been deleted.
                }
            }

            const maxDescriptionLength = 4090
            const displayedLyrics =
                lyrics.length > maxDescriptionLength
                    ? `${lyrics.slice(0, maxDescriptionLength - 20)}\n\n…歌詞內容過長，已截斷。`
                    : lyrics

            const lyricsEmbed = new EmbedBuilder()
                .setURL(song.url)
                .setTitle(`歌詞｜${track.title}`.slice(0, 256))
                .setAuthor({ name: track.author || '未知歌手' })
                .setDescription(displayedLyrics)
                .setImage(track.thumbnail || null)
                .setFooter({ text: '資料來源：Genius Lyrics' })
                .setColor('Gold')

            const closeButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId('close-message')
                    .setLabel('關閉歌詞')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji(emojis.xmark)
            )

            const lyricsMessage = await channel.send({
                embeds: [lyricsEmbed],
                components: [closeButton],
                allowedMentions: { parse: [] }
            })
            player.set('musicLyricsMsgId', lyricsMessage.id)

            await interaction.editReply({
                content: `${emojis.correct} | 已將歌詞顯示在主播放器下方。`
            })
        } catch {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(
                            `${emojis.outage} | 取得歌詞時發生錯誤，請稍後再試。`
                        )
                ]
            })
        }
    }
} satisfies ButtonType
