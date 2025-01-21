const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const Giveaway = require('../../Structures/Schemas/Giveaway')

module.exports = {
    id: 'giveaway-list',
    async execute(interaction, client) {
        const giveaways = await Giveaway.find({
            guildId: interaction.guildId,
            ended: false
        })

        if (giveaways.length === 0) {
            return interaction.reply({
                content: '<:warning:1265562532857380936> | 目前沒有進行中的抽獎活動！',
                ephemeral: true
            })
        }

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('<:gift:1265560472409735181> | 進行中的抽獎')
            .setDescription(
                giveaways
                    .map((g, index) => {
                        const timeLeft = Math.max(0, g.endAt - Date.now())
                        const hours = Math.floor(timeLeft / (1000 * 60 * 60))
                        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

                        return (
                            `**${index + 1}.** ${g.prize}\n` +
                            `<:people:1265561435220611196> | 參加人數：${g.participants.length}\n` +
                            `<:clock:1265562218498363422> | 結束時間：<t:${Math.floor(g.endAt / 1000)}:R>\n` +
                            `<:clock:1265562218498363422> | 剩餘時間：${hours}小時 ${minutes}分鐘\n` +
                            `<:link:1265560772960845965> | [前往抽獎](https://discord.com/channels/${g.guildId}/${g.channelId}/${g.messageId})\n` +
                            `<:person:1265561455529562154> | 主持人：<@${g.hostedBy}>\n`
                        )
                    })
                    .join('\n')
            )
            .setTimestamp()

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('giveaway-refresh')
                .setLabel('重新整理')
                .setEmoji('<:update:1265562455828987968>')
                .setStyle(ButtonStyle.Secondary)
        )

        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        })
    }
}
