const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js')

module.exports = {
    id: 'addSong', // The buttons .setCustomId
    async execute(interaction, client) {
        // To access an id / value from a button you MUST INCLUDE `client` AND `args` and in the same order as shown
        const { member } = interaction
        const VoiceChannel = member.voice.channel

        const queue = client.distube.getQueue(VoiceChannel)

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

        if (!queue)
            return interaction.reply({
                content:
                    '<:outage_868122243845206087:1202112862990897172> | 找不到歌曲或該歌曲已經播放完畢!',
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
