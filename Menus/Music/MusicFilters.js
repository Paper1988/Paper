const { StringSelectMenuInteraction, Client, MessageFlags } = require('discord.js')
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
                    '<:warning:1265562532857380936> | 你必須待在一個語音頻道裡面才能使用音樂指令!',
                flags: MessageFlags.Ephemeral
            })
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return await interaction.reply({
                content: `<:warning:1265562532857380936> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
                flags: MessageFlags.Ephemeral
            })

        const queue = await client.distube.getQueue(VoiceChannel)
        if (!queue)
            return await interaction.reply({
                content: '<:outage:1265561329528471613> | 找不到歌曲或該歌曲已經播放完畢!',
                flags: MessageFlags.Ephemeral
            })
        const msg = `<:warning:1265562532857380936>**注意**: 可能需要等待**3**至**5**秒後才會載入過濾器!`

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

        await interaction.update({ components: [selectMenu, button] })
    }
}
