const { EmbedBuilder, ChatInputCommandInteraction, Client } = require('discord.js')

module.exports = {
    subCommand: 'giveaway.actions',
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    execute(interaction, client) {
        const errEmbed = new EmbedBuilder().setColor('Red')

        const successEmbed = new EmbedBuilder().setColor('Green')

        const choices = interaction.options.getString('options')
        const query = interaction.options.getString('message_id')
        const giveaway =
            // Search with giveaway prize
            client.giveawaysManager.giveaways.find(
                (g) => g.guildId === interaction.guildId && g.prize === query
            ) ||
            // Search with messageId
            client.giveawaysManager.giveaways.find(
                (g) => g.guildId === interaction.guildId && g.messageId === query
            )

        if (!giveaway) {
            errEmbed.setDescription(
                `<:warning:1265562532857380936> | 無法找到訊息ID: ${query}\n請確認有無輸入錯誤!`
            )
            return interaction.reply({ embeds: [errEmbed], ephemeral: true })
        }

        switch (choices) {
            case 'end':
                {
                    client.giveawaysManager
                        .end(query)
                        .then(() => {
                            successEmbed.setDescription(
                                '<:correct:1265560254708711467> | 成功結束抽獎活動!'
                            )
                            interaction.reply({ embeds: [successEmbed], ephemeral: true })
                        })
                        .catch((err) => {
                            errEmbed.setDescription(
                                `<:warning:1265562532857380936> | 發生錯誤: \n\`${err}\``
                            )
                            interaction.reply({ embeds: [errEmbed], ephemeral: true })
                        })
                }
                break
            case 'pause':
                {
                    client.giveawaysManager
                        .pause(query)
                        .then(() => {
                            successEmbed.setDescription(
                                '<:pause:1265561390358331462> | 成功暫停抽獎活動!'
                            )
                            interaction.reply({ embeds: [successEmbed], ephemeral: true })
                        })
                        .catch((err) => {
                            errEmbed.setDescription(
                                `<:warning:1265562532857380936> | 發生錯誤: \n\`${err}\``
                            )
                            interaction.reply({ embeds: [errEmbed], ephemeral: true })
                        })
                }
                break
            case 'unpause':
                {
                    client.giveawaysManager
                        .unpause(query)
                        .then(() => {
                            successEmbed.setDescription(
                                '<:play:1265561505458294826> | 成功繼續進行抽獎活動!'
                            )
                            interaction.reply({ embeds: [successEmbed], ephemeral: true })
                        })
                        .catch((err) => {
                            errEmbed.setDescription(
                                `<:warning:1265562532857380936> | 發生錯誤: \n\`${err}\``
                            )
                            interaction.reply({ embeds: [errEmbed], ephemeral: true })
                        })
                }
                break
            case 'reroll':
                {
                    client.giveawaysManager
                        .reroll(query, {
                            messages: {
                                congrat:
                                    '<:tada:1265562251981750272>恭喜新贏家: {winners}! 贏得獎品: **{this.prize}**!',
                                error: '<:outage:1265561329528471613> | 無有效的參與人數，所以沒有新贏家!'
                            }
                        })
                        .then(() => {
                            successEmbed.setDescription(
                                '<:loop1:1265560917345570918> | 成功重新抽選抽獎活動的贏家!'
                            )
                            interaction.reply({ embeds: [successEmbed], ephemeral: true })
                        })
                        .catch((err) => {
                            errEmbed.setDescription(
                                `<:warning:1265562532857380936> | 發生錯誤: \n\`${err}\``
                            )
                            interaction.reply({ embeds: [errEmbed], ephemeral: true })
                        })
                }
                break
            case 'delete':
                {
                    client.giveawaysManager
                        .delete(query)
                        .then(() => {
                            successEmbed.setDescription(
                                '<:delete:1265560264061882471> | 成功刪除抽獎活動!'
                            )
                            interaction.reply({ embeds: [successEmbed], ephemeral: true })
                        })
                        .catch((err) => {
                            errEmbed.setDescription(
                                `<:warning:1265562532857380936> | 發生錯誤: \n\`${err}\``
                            )
                            interaction.reply({ embeds: [errEmbed], ephemeral: true })
                        })
                }
                break
        }
    }
}
