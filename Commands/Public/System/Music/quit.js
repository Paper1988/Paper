const { ChatInputCommandInteraction, Client } = require('discord.js')

module.exports = {
    subCommand: 'music.quit',
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const { member } = interaction
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel)
            return await interaction.reply({
                content: '<:warning:1265562532857380936> | 你必須待在語音頻道裡面才能使用音樂指令!',
                ephemeral: true
            })

        await client.distube.voices.leave(VoiceChannel)
        return await interaction.reply({
            content: '<:leave:1265560726240497684> | 成功離開語音頻道!',
            ephemeral: true
        })
    }
}
