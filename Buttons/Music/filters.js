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
        const { member } = interaction
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel)
            return interaction.reply({
                content:
                    '<:warning_908958943466893323:1201844340276862976> | 你必須待在一個語音頻道裡面才能使用音樂按鈕!',
                ephemeral: true
            })
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return interaction.reply({
                content: `<:warning_908958943466893323:1201844340276862976> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
                ephemeral: true
            })

        const queue = client.distube.getQueue(VoiceChannel)

        if (!queue)
            return interaction.reply({
                content:
                    '<:outage_868122243845206087:1202112862990897172> | 找不到歌曲或該歌曲已經播放完畢!',
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
                .setLabel('關')
                .setCustomId('false')
                .setEmoji('<:xmark_988409378161954866:1201844342029815848>')
                .setStyle(ButtonStyle.Danger)
        ])

        await interaction.reply({
            content: '<:spark_860123643722727444:1201844297041973320> | 請選擇過濾器',
            components: [selectMenu, button],
            ephemeral: true
        })
        module.exports = { selectMenu, button }
    }
}
