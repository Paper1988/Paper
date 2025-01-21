const GiveawayNotification = require('../Structures/Schemas/GiveawayNotification');

async function sendGiveawayNotification(client, type, giveaway, userId) {
    const userSettings = await GiveawayNotification.findOne({
        guildId: giveaway.guildId,
        userId: userId
    });

    if (!userSettings) return;

    // 檢查用戶是否啟用了對應類型的通知
    let shouldNotify = false;
    let message = '';

    switch (type) {
        case 'start':
            if (userSettings.notifyStart) {
                shouldNotify = true;
                message = `🎉 新的抽獎活動開始了！\n獎品：**${giveaway.prize}**\n結束時間：<t:${Math.floor(giveaway.endAt / 1000)}:R>\n[點擊參加](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId})`;
            }
            break;
        case 'end':
            // 如果用戶是得獎者，不發送結束通知
            if (userSettings.notifyEnd && !giveaway.winners.includes(userId)) {
                shouldNotify = true;
                message = `🏁 抽獎活動已結束！\n獎品：**${giveaway.prize}**\n得獎者：${giveaway.winners.map(w => `<@${w}>`).join(', ') || '無人得獎'}`;
            }
            break;
        case 'win':
            if (userSettings.notifyWin) {
                shouldNotify = true;
                message = `🎯 恭喜你在抽獎中獲勝！\n獎品：**${giveaway.prize}**\n[查看抽獎](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId})`;
            }
            break;
        case 'reminder':
            if (userSettings.notifyReminder) {
                shouldNotify = true;
                message = `⏰ 抽獎即將結束！\n獎品：**${giveaway.prize}**\n結束時間：<t:${Math.floor(giveaway.endAt / 1000)}:R>\n[點擊查看](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId})`;
            }
            break;
    }

    if (!shouldNotify) return;

    try {
        const user = await client.users.fetch(userId);
        // 發送私人訊息
        await user.send({ content: message });
    } catch (error) {
        console.error('發送抽獎通知時發生錯誤:', error);
    }
}

module.exports = { sendGiveawayNotification }; 