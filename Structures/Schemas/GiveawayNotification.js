const mongoose = require('mongoose');

const giveawayNotificationSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    // 通知設定
    notifyStart: { type: Boolean, default: true },  // 新抽獎開始時通知
    notifyEnd: { type: Boolean, default: true },    // 抽獎結束時通知
    notifyWin: { type: Boolean, default: true },    // 中獎時通知
    notifyReminder: { type: Boolean, default: true }, // 抽獎即將結束時通知
    // DM 或頻道通知
    dmNotification: { type: Boolean, default: true },
    channelId: { type: String, default: null }      // 如果不是DM，則在指定頻道通知
});

module.exports = mongoose.model('GiveawayNotification', giveawayNotificationSchema); 