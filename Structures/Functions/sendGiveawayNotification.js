const { EmbedBuilder } = require('discord.js');
const GiveawayNotification = require('../Schemas/GiveawayNotification');

async function sendGiveawayNotification(client, type, giveaway, userId = null) {
    const notifications = await GiveawayNotification.find({
        guildId: giveaway.guildId,
        [`notify${type.charAt(0).toUpperCase() + type.slice(1)}`]: true,
        ...(userId ? { userId } : {})
    });

    for (const notification of notifications) {
        try {
            const user = await client.users.fetch(notification.userId);
            if (!user) continue;

            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setTimestamp();

            switch (type) {
                case 'start':
                    embed.setTitle('<:tada:1265560254708711467> | 新抽獎活動開始')
                        .setDescription(`
                            <:gift:1265560472409735181> | 獎品：**${giveaway.prize}**
                            <:clock:1265562218498363422> | 結束時間：<t:${Math.floor(giveaway.endTime.getTime() / 1000)}:R>
                            <:link:1265560772960845965> | [點擊參加](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId})
                        `);
                    break;
                case 'end':
                    embed.setTitle('<:stop:1265560254708711467> | 抽獎活動結束')
                        .setDescription(`
                            <:gift:1265560472409735181> | 獎品：**${giveaway.prize}**
                            <:person:1265561455529562154> | 得獎者：${giveaway.winners.map(w => `<@${w}>`).join(', ') || '無人得獎'}
                        `);
                    break;
                case 'win':
                    embed.setTitle('<:gift:1265560472409735181> | 恭喜中獎！')
                        .setDescription(`你在抽獎活動中獲得了：**${giveaway.prize}**\n請聯繫主持人 <@${giveaway.hosterId}> 領取獎品`);
                    break;
                case 'reminder':
                    embed.setTitle('<:reminder:1265560254708711467> | 抽獎即將結束')
                        .setDescription(`
                            <:gift:1265560472409735181> | 獎品：**${giveaway.prize}**
                            <:clock:1265562218498363422> | 結束時間：<t:${Math.floor(giveaway.endTime.getTime() / 1000)}:R>
                            <:link:1265560772960845965> | [立即查看](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId})
                        `);
                    break;
            }

            if (notification.dmNotification) {
                await user.send({ embeds: [embed] }).catch(() => {});
            } else if (notification.channelId) {
                const channel = await client.channels.fetch(notification.channelId);
                if (channel) {
                    await channel.send({ content: `<@${notification.userId}>`, embeds: [embed] });
                }
            }
        } catch (error) {
            console.error(`無法傳送通知給 ${notification.userId}:`, error);
        }
    }
}

module.exports = { sendGiveawayNotification }; 