const { EmbedBuilder, ChatInputCommandInteraction, Client } = require('discord.js')
const ms = require('ms')

module.exports = {
    subCommand: 'giveaway.start',
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const errEmbed = new EmbedBuilder().setColor('Red')
        const successEmbed = new EmbedBuilder().setColor('Green')

        const duration = interaction.options.getString('duration')
        const winnerCount = interaction.options.getInteger('winners') || 1
        const prize = interaction.options.getString('prize')
        const gchannel = interaction.options.getChannel('channel') || interaction.channel
        const isDrop = interaction.options.getBoolean('drop') || false
        const attachment = interaction.options.getAttachment('attachment') || null
        const role = interaction.options.getRole('role')

        await client.giveawaysManager
            .start(gchannel, {
                duration: ms(duration),
                winnerCount,
                prize,
                messages: {
                    giveaway:
                        '<:tada:1265562251981750272>**抽獎活動開始了**<:tada:1265562251981750272>',
                    giveawayEnded: '🎊**抽獎活動結束了**🎊',
                    inviteToParticipate: role
                        ? `**點擊🎉來參加抽獎!**\n需要擁有 ${role} 才能參與`
                        : '**點擊🎉來參加抽獎!**',
                    winMessage:
                        '<:tada:1265562251981750272>恭喜贏家 {winners} 贏得獎品: **`{this.prize}`** !\n{this.messageURL}',
                    noWinner: '抽獎活動已取消，因為: `參與人數不足`',
                    dropMessage: '成為第一位參加的人!',
                    drawing: '剩餘時間: {timestamp}',
                    winners: '贏家:',
                    endedAt: '結束時間',
                    hostedBy: '舉辦人: {this.hostedBy}',
                    embedFooter: '{this.winnerCount}位贏家'
                },
                thumbnail: attachment,
                isDrop,
                allowMentions: ['users'],
                pauseOptions: {
                    isPaused: false,
                    content:
                        '<:warning:1265562532857380936> **這個抽獎活動已被暫停!** <:warning:1265562532857380936>',
                    unpauseAfter: null,
                    embedColor: '#FFFF00',
                    infiniteDurationText: '`無限長`'
                },
                lastChance: {
                    enabled: true,
                    content:
                        '<:warning:1265562532857380936> **最後加入的機會!** <:warning:1265562532857380936>',
                    threshold: 10_000,
                    embedColor: '#FF0000'
                },
                exemptMembers: (member) => !member.roles.cache.some((r) => r.name === role.name)
            })
            .then(async () => {
                successEmbed.setDescription('<:correct:1265560254708711467> | 抽獎活動成功開始!')
                return interaction.reply({ embeds: [successEmbed], ephemeral: true })
            })
            .catch((err) => {
                errEmbed.setDescription(`<:warning:1265562532857380936> | 發生錯誤: \n\`${err}\``)
                return interaction.reply({ embeds: [errEmbed], ephemeral: true })
            })
    }
}
