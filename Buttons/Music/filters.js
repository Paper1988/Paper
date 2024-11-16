const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js')

module.exports = {
    id: 'filters',
    async execute(interaction, client) {
        await interaction.deferReply({ fetchReply: true, ephemeral: true })
        const { member } = interaction
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel)
            return await interaction.editReply({
                content: '<:warning:1265562532857380936> | 你必須待在語音頻道裡面才能使用音樂按鈕!',
                ephemeral: true
            })
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return await interaction.editReply({
                content: `<:warning:1265562532857380936> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
                ephemeral: true
            })

        const queue = await client.distube.getQueue(VoiceChannel)
        if (!queue)
            return await interaction.editReply({
                content: '<:outage:1265561329528471613> | 找不到歌曲或該歌曲已經播放完畢!',
                ephemeral: true
            })

        const filters = new StringSelectMenuBuilder()
            .setCustomId('filters')
            .setPlaceholder('請選擇過濾器')
            .setMinValues(1)

        for (const filter in client.distube.filters) {
            filters.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(filter)
                    .setDescription(`增加/移除 ${filter}`)
                    .setValue(filter)
            )
        }

        const selectMenu = new ActionRowBuilder().addComponents([filters])

        const button = new ActionRowBuilder().addComponents([
            new ButtonBuilder()
                .setLabel('全部關閉')
                .setCustomId('false')
                .setEmoji('<:xmark:1265562550947545089>')
                .setStyle(ButtonStyle.Danger)
        ])

        await interaction.editReply({
            content: '<:spark:1265561903195750471> | 請選擇過濾器',
            components: [selectMenu, button],
            ephemeral: true
        })
        module.exports = { selectMenu, button }
    }
}
