const {
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ChatInputCommandInteraction,
    Client
} = require('discord.js')
const { emojis } = require('../../libs/emoji/emoji')

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
            return await interaction
                .reply({
                    content: `${emojis.warning} | 你必須待在語音頻道裡面才能使用音樂按鈕!`
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))
        if (client.voice.channelId && VoiceChannel.id !== client.voice.channelId)
            return await interaction
                .reply({
                    content: `${emojis.warning} | 我已經在語音頻道 - <#${client.voice.channelId}> 裡播放音樂了`
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))

        const queue = await client.distube.getQueue(VoiceChannel)
        if (!queue)
            return await interaction
                .reply({
                    content: `${emojis.warning} | 找不到歌曲或該歌曲已經播放完畢!`
                })
                .then((msg) => setTimeout(() => msg.delete(), 10 * 1000))

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
