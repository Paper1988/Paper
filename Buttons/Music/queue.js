const { EmbedBuilder } = require('discord.js')

module.exports = {
    id: 'queue',
    async execute(interaction, client) {
        await interaction.deferReply({ fetchReply: true })
        // To access an id / value from a button you MUST INCLUDE `client` AND `args` and in the same order as shown
        const { member } = interaction
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel)
            return await interaction
                .editReply({
                    content:
                        '<:warning:1265562532857380936> | 你必須待在語音頻道裡面才能使用音樂按鈕!'
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return await interaction
                .editReply({
                    content: `<:warning:1265562532857380936> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))

        const queue = await client.distube.getQueue(VoiceChannel)
        if (!queue)
            return await interaction
                .editReply({
                    content: '<:outage:1265561329528471613> | 找不到歌曲或該歌曲已經播放完畢!'
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))

        let leftSongs
        if (queue.songs.length - 10 > 0) {
            leftSongs = queue.songs.length - 10
        } else {
            leftSongs = 0
        }
        return await interaction
            .editReply({
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
            .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
    }
}
