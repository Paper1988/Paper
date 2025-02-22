const { ChatInputCommandInteraction, Client, MessageFlags } = require('discord.js')

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
                content: '<:warning:1265562532857380936> | 你必須待在語音頻道裡面才能使用音樂指令!',
                flags: MessageFlags.Ephemeral
            })
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return interaction.reply({
                content: `<:warning:1265562532857380936> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
                flags: MessageFlags.Ephemeral
            })

        const queue = await client.distube.getQueue(VoiceChannel)
        const msg = `<:warning:1265562532857380936> | **注意**，可能需要等待**3**至**5**秒後才會載入過濾器!`

        if (!queue)
            return interaction.reply({
                content: '<:outage:1265561329528471613> | 找不到歌曲!',
                flags: MessageFlags.Ephemeral
            })

        const filters = queue.filters
        if (filters.has(filter)) {
            filters.remove(filter)
            return interaction.reply({
                content: `<:linkremove:1265560814769672222> | 成功移除 \`${filter}\` 過濾器\n${msg}`
            })
        } else {
            await filters.add(filter)
            return interaction.reply({
                content: `<:linkadd:1265560789503311915> | 成功增加 \`${filter}\` 過濾器\n${msg}`
            })
        }
    }
}
