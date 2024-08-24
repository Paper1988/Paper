const { StringSelectMenuInteraction, Client } = require('discord.js')
const { selectMenu, button } = require('../../Buttons/Music/filters')

module.exports = {
    id: 'filters',
    /**
     * @param {StringSelectMenuInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const { member } = interaction
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel)
            return await interaction.reply({
                content:
                    '<:warning_908958943466893323:1201844340276862976> | 你必須待在一個語音頻道裡面才能使用音樂指令!',
                ephemeral: true
            })
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return await interaction.reply({
                content: `<:warning_908958943466893323:1201844340276862976> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
                ephemeral: true
            })

        const queue = await client.distube.getQueue(VoiceChannel)
        if (!queue)
            return await interaction.reply({
                content:
                    '<:outage_868122243845206087:1202112862990897172> | 找不到歌曲或該歌曲已經播放完畢!',
                ephemeral: true
            })
        const msg = `<:warning_908958943466893323:1201844340276862976>**注意**: 可能需要等待**3**至**5**秒後才會載入過濾器!`

        const filter = interaction.values[0]

        const filters = queue.filters
        if (filters.has(filter)) {
            await filters.remove(filter)
            await interaction.channel
                .send({
                    content: `<:linkremove_865572289022394368:1201843685084647435> | 成功移除 \`${filter}\` 過濾器\n${msg}`
                })
                .then((msg) => setTimeout(() => msg.delete(), 5 * 1000))
        } else {
            await filters.add(filter)
            await interaction.channel
                .send({
                    content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 \`${filter}\` 過濾器\n${msg}`
                })
                .then((msg) => setTimeout(() => msg.delete(), 5 * 1000))
        }

        await interaction
            .deferUpdate()
            .then((message) => message.edit({ components: [selectMenu, button] }))
    }
}
