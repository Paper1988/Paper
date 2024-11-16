const { ChatInputCommandInteraction, EmbedBuilder } = require('discord.js')
const DB = require('../../../Structures/Schemas/AntiAlt')

module.exports = {
    subCommand: 'anti-alt.reset',
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const { guild } = interaction

        const LogsReset = new EmbedBuilder()
            .setDescription('<:correct:1265560254708711467> | 成功重置日誌頻道')
            .setColor('#43b581')

        DB.deleteMany({ GuildID: guild.id }, async (err, data) => {
            if (err) throw err
            if (!data)
                return interaction.reply({
                    content: '<:warning:1265562532857380936> | 找不到數據'
                })
            interaction.reply({ embeds: [LogsReset] })
        })
    }
}
