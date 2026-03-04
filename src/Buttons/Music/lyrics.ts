import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { deleteMessageAfter, MusicDbFetch } from '@/Systems/Music.js'
import emojis from '@/libs/emoji/emoji.js'
import type { ButtonType } from '@/typings/component.js'
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder,
    GuildMember
} from 'discord.js'
import Genius from 'genius-lyrics'
import type { Player } from 'moonlink.js'

export default {
    id: 'lyrics',
    async execute(interaction: ButtonInteraction, client: PaperClient) {
        await interaction.deferReply()
        const member = interaction.member! as GuildMember

        const VoiceChannel = member.voice.channel

        if (!VoiceChannel) {
            return await interaction
                .editReply({
                    content: `${emojis.warning} | 你必須待在語音頻道裡面才能使用音樂按鈕!`
                })
                .then(deleteMessageAfter)
        }

        const Client = new Genius.Client()
        const currentPlayer = client.moonlink?.players.get(interaction.guildId!) as Player
        if (currentPlayer?.voiceChannelId && VoiceChannel.id !== currentPlayer.voiceChannelId) {
            return await interaction
                .editReply({
                    content: `${emojis.warning} | 我已經在語音頻道 - <#${currentPlayer.voiceChannelId}> 裡播放音樂了`
                })
                .then(deleteMessageAfter)
        }

        const db = await MusicDbFetch(interaction.guild!)

        let player: Player

        if (!currentPlayer) {
            player = client.moonlink!.players.create({
                guildId: interaction.guild!.id,
                voiceChannelId: VoiceChannel.id,
                textChannelId: interaction.channel!.id,
                autoLeave: true,
                autoPlay: db.autoplay ?? false,
                loop: db.repeatMode ?? 0,
                volume: db.volume ?? 50
            })
        } else {
            player = currentPlayer
        }

        if (!player.playing)
            return await interaction
                .editReply({
                    content: `${emojis.outage} | 找不到歌曲或該歌曲已經播放完畢!`
                })
                .then(deleteMessageAfter)

        await Client.songs
            .search(player.current?.title ?? '')
            .then(async (songs) => {
                const song = songs[0]!

                const lyrics = await song.lyrics()

                const Embed = new EmbedBuilder()
                    .setURL(song.url)
                    .setTitle(player.current?.title ?? '')
                    .setAuthor({ name: player.current?.author ?? '未知歌手' })
                    .setDescription(lyrics)
                    .setImage(player.current?.thumbnail as string | null)
                    .setFooter({
                        text: '資料來源: Genius Lyrics',
                        iconURL:
                            'https://cdn.discordapp.com/attachments/1202111758764867645/1268911286977298502/unnamed.png?ex=66ae253a&is=66acd3ba&hm=89779e3dd1db9793fa3ea864cff4d22fb6d06997b6c0cc0a5cbdb24f710c5ab5&'
                    })
                    .setColor('Gold')

                const closeButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId('close-message')
                        .setLabel('關閉')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji(emojis.xmark)
                )

                await interaction.editReply({ embeds: [Embed], components: [closeButton] })
            })
            .catch(async () => {
                await interaction
                    .editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Red')
                                .setDescription(
                                    `<:loadingerror:1268935312751595622> | 找不到 \`${player.current?.title}\` 的歌詞!`
                                )
                                .setFooter({
                                    text: '歌詞資料來源: Genius Lyrics',
                                    iconURL:
                                        'https://cdn.discordapp.com/attachments/1202111758764867645/1268911286977298502/unnamed.png?ex=66ae253a&is=66acd3ba&hm=89779e3dd1db9793fa3ea864cff4d22fb6d06997b6c0cc0a5cbdb24f710c5ab5&'
                                })
                        ]
                    })
                    .then(deleteMessageAfter)
            })
    }
} satisfies ButtonType
