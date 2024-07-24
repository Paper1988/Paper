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
                content:
                    '<:warning_908958943466893323:1201844340276862976> | 你必須待在語音頻道裡面才能使用音樂指令!',
                ephemeral: true
            })

        await client.distube.voices.leave(VoiceChannel)
        return await interaction.reply({
            content: '<:leave_860487640113217546:1202217506991771658> | 成功離開語音頻道!',
            ephemeral: true
        })
    }
}
