const { StringSelectMenuInteraction } = require('discord.js')

module.exports = {
    id: 'playlist-select',
    /**
     *
     * @param {StringSelectMenuInteraction} interaction
     * @returns
     */
    async execute(interaction) {
        if (!interaction.isStringSelectMenu()) return

        const selectedSongUrl = interaction.values[0] // 獲取選擇的歌曲 URL

        // 播放選擇的歌曲
        await interaction.client.distube.play(interaction.member.voice.channel, selectedSongUrl, {
            member: interaction.member,
            textChannel: interaction.channel,
            metadata: { interaction }
        })

        await interaction.reply({
            content: `開始播放選擇的歌曲: ${selectedSongUrl}`,
            ephemeral: true
        })
    }
}
