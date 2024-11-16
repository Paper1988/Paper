const {
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ChatInputCommandInteraction,
    Client
} = require('discord.js')

module.exports = {
    id: 'addSong', // The buttons .setCustomId
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     * @returns
     */
    async execute(interaction, client) {
        // To access an id / value from a button you MUST INCLUDE `client` AND `args` and in the same order as shown
        const { member } = interaction
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel)
            return await interaction.reply({
                content: '<:warning:1265562532857380936> | 你必須待在語音頻道裡面才能使用音樂按鈕!',
                ephemeral: true
            })
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return await interaction.reply({
                content: `<:warning:1265562532857380936> | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`,
                ephemeral: true
            })

        const queue = await client.distube.getQueue(VoiceChannel)
        if (!queue)
            return await interaction.reply({
                content: '<:outage:1265561329528471613> | 找不到歌曲或該歌曲已經播放完畢!',
                ephemeral: true
            })

        const modal = new ModalBuilder().setCustomId('addSong').setTitle('添加歌曲')

        const SongNameInput = new TextInputBuilder()
            .setCustomId('songName')
            .setLabel('請提供歌曲名稱')
            .setPlaceholder('請輸入關鍵字或連結!')
            // Short means only a single line of text
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        const firstActionRow = new ActionRowBuilder().addComponents(SongNameInput)

        modal.addComponents(firstActionRow)

        await interaction.showModal(modal)
    }
}
