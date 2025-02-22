const { EmbedBuilder, ChatInputCommandInteraction, Client, MessageFlags } = require('discord.js')
const MusicDB = require('../../../../Structures/Schemas/MusicDB')
const { updateMusicPlayerStatus, clearPlayer } = require('../../../../Systems/Music')
const { Events } = require('distube')

module.exports = {
    subCommand: 'music.settings',
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const { options, member } = interaction
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel)
            return interaction.reply({
                content: '<:warning:1265562532857380936> | 你必須待在語音頻道裡面才能使用音樂指令!',
                flags: MessageFlags.Ephemeral
            })
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return interaction.reply({
                content: `<:warning:1265562532857380936> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
                flags: MessageFlags.Ephemeral
            })

        const queue = await client.distube.getQueue(VoiceChannel)

        if (!queue)
            return interaction.reply({
                content: '<:outage:1265561329528471613> | 找不到歌曲或該歌曲已經播放完畢!'
            })

        switch (options.getString('options')) {
            case 'skip':
                if (!queue.songs[1] && !queue.autoplay)
                    return interaction.reply({
                        content: '<:outage:1265561329528471613> | 這是最後一首歌了!'
                    })
                await queue.skip(VoiceChannel)
                return interaction.reply({
                    content: '<:frontforward:1265560424510787584> | 成功跳過歌曲'
                })

            case 'stop':
                await queue.stop(VoiceChannel)
                await updateMusicPlayerStatus(queue, true)
                clearPlayer(queue)
                await queue.voice.leave()
                return interaction.reply({
                    content: '<:stop:1265562218498363422> | 成功停止音樂並退出語音頻道'
                })

            case 'togglePause':
                if (!queue.paused) {
                    await queue.pause(VoiceChannel)
                    return interaction.reply({
                        content: '<:pause:1265561390358331462> | 成功暫停播放歌曲'
                    })
                } else {
                    await queue.resume(VoiceChannel)
                    return interaction.reply({
                        content: '<:play:1265561505458294826> | 成功恢復播放歌曲'
                    })
                }

            case 'shuffle':
                await queue.shuffle(VoiceChannel)
                return interaction.reply({
                    content: '<:shuffle:1265561846690222081> | 成功隨機播放歌曲'
                })

            case 'autoplay':
                let Mode = await queue.toggleAutoplay(VoiceChannel)
                await MusicDB.findOneAndUpdate(
                    { GuildID: queue.id },
                    { autoplayMode: Mode ? true : false },
                    { new: true, upsert: true }
                )
                return interaction.reply({
                    content: `<:update:1265562455828987968> | 成功切換自動播放模式: ${
                        Mode ? '<:correct:1265560254708711467>' : '<:xmark:1265562550947545089>'
                    }`
                })

            case 'previous':
                await queue.previous(VoiceChannel)
                await queue.emit(Events.FINISH_SONG, queue)
                return interaction.reply({
                    content: '<:backforward:1265557186621345833> | 成功播放上一首歌曲'
                })

            case 'related':
                await queue.addRelatedSong(VoiceChannel)
                return interaction.reply({
                    content: '<:plus:1265561528866967667> | 成功添加相似歌曲到播放清單中'
                })

            case 'repeat':
                let Mode2 = await client.distube.setRepeatMode(queue)
                await MusicDB.findOneAndUpdate(
                    { GuildID: queue.id },
                    { repeatMode: (Mode2 = Mode2 ? (Mode2 == 2 ? 2 : 1) : 0) },
                    { new: true, upsert: true }
                )
                return interaction.reply({
                    content: `<:loop1:1265560917345570918> | 成功切換重複播放模式: ${(Mode2 = Mode2
                        ? Mode2 == 2
                            ? '<:loop2:1265560938417754213>整個清單'
                            : '<:looponce:1265560956193210399>單曲'
                        : '<:xmark:1265562550947545089>')}`
                })

            case 'queue':
                let leftSongs
                if (queue.songs.length - 10 > 0) {
                    leftSongs = queue.songs.length - 10
                } else {
                    leftSongs = 0
                }

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Purple')
                            .setDescription(
                                `<:queue:1265561609632485478> | 播放清單\n${queue.songs
                                    .slice(0, 10)
                                    .map(
                                        (song, id) =>
                                            `\n**${id + 1}**. \`${song.name}\` - \`${song.formattedDuration}\``
                                    )}\n\n- \`和另外${leftSongs}首歌\``
                            )
                            .setImage(queue.songs[0].thumbnail)
                            .setTimestamp()
                    ]
                })
        }
    }
}
