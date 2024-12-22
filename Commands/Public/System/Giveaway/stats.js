const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const GiveawayStats = require('../../../../Structures/Schemas/GiveawayStats');
const GiveawayHistory = require('../../../../Structures/Schemas/GiveawayHistory');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveawaystats')
        .setDescription('查看抽獎統計資訊'),
    
    async execute(interaction) {
        await interaction.deferReply();

        const stats = await GiveawayStats.findOne({ guildId: interaction.guildId }) || 
            new GiveawayStats({ guildId: interaction.guildId });

        const recentHistory = await GiveawayHistory.find({ 
            guildId: interaction.guildId 
        })
        .sort({ createdAt: -1 })
        .limit(5);

        const statsEmbed = new EmbedBuilder()
            .setTitle('📊 抽獎統計')
            .setColor('Blue')
            .addFields(
                { name: '總抽獎次數', value: stats.totalGiveaways.toString(), inline: true },
                { name: '進行中抽獎', value: stats.activeGiveaways.toString(), inline: true },
                { name: '總參與人次', value: stats.totalParticipants.toString(), inline: true },
                { name: '總獎品數量', value: stats.totalPrizes.toString(), inline: true },
                { name: '總得獎人數', value: stats.totalWinners.toString(), inline: true },
                { name: '\u200B', value: '\u200B', inline: true }
            );

        if (stats.mostActiveHoster?.userId) {
            statsEmbed.addFields({
                name: '最活躍主持人',
                value: `<@${stats.mostActiveHoster.userId}> (${stats.mostActiveHoster.count}次)`,
                inline: true
            });
        }

        if (stats.mostWonUser?.userId) {
            statsEmbed.addFields({
                name: '最幸運用戶',
                value: `<@${stats.mostWonUser.userId}> (${stats.mostWonUser.count}次)`,
                inline: true
            });
        }

        if (recentHistory.length > 0) {
            statsEmbed.addFields({
                name: '最近的抽獎',
                value: recentHistory.map(h => 
                    `🎁 ${h.prize} | 贏家: ${h.winners.length > 0 ? h.winners.map(w => `<@${w}>`).join(', ') : '無'}`
                ).join('\n')
            });
        }

        await interaction.editReply({ embeds: [statsEmbed] });
    }
}; 