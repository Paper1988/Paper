const { ChatInputCommandInteraction, Client } = require('discord.js')

module.exports = {
    subCommand: 'music.filters',
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const { options, member } = interaction
        const filter = options.getString('set')
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel)
            return interaction.reply({
                content:
                    '<:warning_908958943466893323:1201844340276862976> | 你必須待在語音頻道裡面才能使用音樂指令!',
                ephemeral: true
            })
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return interaction.reply({
                content: `<:warning_908958943466893323:1201844340276862976> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
                ephemeral: true
            })

        const queue = await client.distube.getQueue(VoiceChannel)
        const msg = `<:warning_908958943466893323:1201844340276862976>**注意**: 可能需要等待**3**至**5**秒後才會載入過濾器!`

        if (!queue)
            return interaction.reply({
                content: '<:outage_868122243845206087:1202112862990897172> | 找不到歌曲!',
                ephemeral: true
            })

        const filters = queue.filters
        if (filters.has(filter)) {
            filters.remove(filter)
            return interaction.reply({
                content: `<:linkremove_865572289022394368:1201843685084647435> | 成功移除 \`${filter}\` 過濾器\n${msg}`
            })
        } else {
            await filters.add(filter)
            return interaction.reply({
                content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 \`${filter}\` 過濾器\n${msg}`
            })
        }
    }
}
