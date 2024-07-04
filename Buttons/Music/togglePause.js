const { updateMusicPlayerStatus, generateMusicStatusButtons } = require('../../Systems/Music')

module.exports = {
    id: 'togglePause', // The buttons .setCustomId
    async execute(interaction, client) {
        // To access an id / value from a button you MUST INCLUDE `client` AND `args` and in the same order as shown
        const { member } = interaction
        const VoiceChannel = member.voice.channel
        const queue = client.distube.getQueue(VoiceChannel)

        if (!VoiceChannel)
            return interaction.reply({
                content:
                    '<:warning_908958943466893323:1201844340276862976> | 你必須待在語音頻道裡面才能使用音樂按鈕!',
                ephemeral: true
            })
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return interaction.reply({
                content: `<:warning_908958943466893323:1201844340276862976> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
                ephemeral: true
            })

        if (!queue)
            return interaction.reply({
                content:
                    '<:outage_868122243845206087:1202112862990897172> | 找不到歌曲或該歌曲已經播放完畢!',
                ephemeral: true
            })

        if (!queue.paused) {
            await queue.pause(VoiceChannel)
            await generateMusicStatusButtons(queue)[0].components[2].setEmoji(
                '<:play_861852632800952320:1202112864857628692>'
            )
            await updateMusicPlayerStatus(queue)
            return interaction.reply({
                content: '<:pause_861852632914198548:1201843739728035961> | 成功暫停播放歌曲',
                ephemeral: true
            })
        } else {
            await queue.resume(VoiceChannel)
            await generateMusicStatusButtons(queue)[0].components[2].setEmoji(
                '<:pause_861852632914198548:1201843739728035961>'
            )
            await updateMusicPlayerStatus(queue)
            return interaction.reply({
                content: '<:play_861852632800952320:1202112864857628692> | 成功恢復播放歌曲',
                ephemeral: true
            })
        }
    }
}
