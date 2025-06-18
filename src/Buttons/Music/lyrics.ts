import { ButtonInteraction, EmbedBuilder, GuildMember } from 'discord.js'

import Genius from 'genius-lyrics'
const Client = new Genius.Client()

import type { PaperClient } from '@/classes/PaperClient.js'
import emojis from '@/libs/emoji/emoji.js'
import { deleteMessageAfter } from '@/Systems/Music.js'
import type { ButtonType } from '@/typings/component.js'

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
                .then((msg) => deleteMessageAfter(msg, 10 * 1000))
        }

        const currentVoiceChannel = interaction.guild?.members.me?.voice.channelId
        if (currentVoiceChannel && VoiceChannel.id !== currentVoiceChannel) {
            return await interaction.editReply({
                content: `${emojis.warning} | 我已經在語音頻道 - <#${currentVoiceChannel}> 裡播放音樂了`
            })
        }

        const queue = client.distube.getQueue(VoiceChannel)
        if (!queue) {
            return await interaction
                .editReply({
                    content: `${emojis.outage} | 找不到歌曲或該歌曲已經播放完畢!`
                })
                .then((msg) => deleteMessageAfter(msg, 10 * 1000))
        }

        const currentSong = queue.songs[0]
        if (!currentSong) {
            return await interaction.editReply({
                content: `${emojis.outage} | 無法獲取當前歌曲信息！`
            })
        }

        await Client.songs
            .search(currentSong.name ?? '')
            .then(async (songs) => {
                const song = songs[0]!

                const lyrics = await song.lyrics()

                const Embed = new EmbedBuilder()
                    .setURL(song.url)
                    .setTitle(currentSong.name!)
                    .setAuthor({ name: currentSong.uploader?.name ?? '未知歌手' })
                    .setDescription(lyrics)
                    .setImage(currentSong.thumbnail as string | null)
                    .setFooter({
                        text: '資料來源: Genius Lyrics',
                        iconURL:
                            'https://cdn.discordapp.com/attachments/1202111758764867645/1268911286977298502/unnamed.png?ex=66ae253a&is=66acd3ba&hm=89779e3dd1db9793fa3ea864cff4d22fb6d06997b6c0cc0a5cbdb24f710c5ab5&'
                    })
                    .setColor('Gold')

                await interaction.editReply({ embeds: [Embed] })
            })
            .catch(async () => {
                await interaction
                    .editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Red')
                                .setDescription(
                                    `<:loadingerror:1268935312751595622> | 找不到 \`${currentSong?.name}\` 的歌詞!`
                                )
                                .setFooter({
                                    text: '歌詞資料來源: Genius Lyrics',
                                    iconURL:
                                        'https://cdn.discordapp.com/attachments/1202111758764867645/1268911286977298502/unnamed.png?ex=66ae253a&is=66acd3ba&hm=89779e3dd1db9793fa3ea864cff4d22fb6d06997b6c0cc0a5cbdb24f710c5ab5&'
                                })
                        ]
                    })
                    .then(() =>
                        setTimeout(async () => {
                            await interaction.deleteReply()
                        }, 15 * 1000)
                    )
            })
    }
} satisfies ButtonType
