const {
    StringSelectMenuInteraction,
    ActionRowBuilder,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js')

module.exports = {
    id: 'helpMenu',
    /**
     * @param {StringSelectMenuInteraction} i
     */
    async execute(i) {
        if (!i.customId === 'helpMenu') return
        const generalCommands = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('help:back')
                .setLabel('返回')
                .setStyle(ButtonStyle.Primary)
        )

        const inviteMe = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('邀請我')
                .setStyle(ButtonStyle.Link)
                .setURL(
                    'https://discord.com/api/oauth2/authorize?client_id=***REMOVED***&permissions=1644971945463&scope=bot%20applications.commands'
                )
        )

        const publicEm = new EmbedBuilder()
            .setTitle('🔧一般 General')
            .setColor('Green')
            .setDescription(
                '> </help:1131066238915842059>: 顯示這個列表\n> </botinfo:1131066238915842060>: 顯示有關Paper的資訊\n> </ping:1131066238777426001>: Pong!\n> </invite:1131066238915842058>: 顯示Paper的邀請指令\n> </serverinfo:1131066238777426000>: 顯示伺服器的資訊\n> </userinfo:1131066238777425998>: 取得一位用戶的資訊\n> </report:1158752288928710706>: 回報給我們bug、建議\n> </credits:1202478482316329031>: 檢視版權資訊\n> </mcstats:1202453198078738525>: 顯示一個Minecraft伺服器的資訊\n> </say:1203269049610539089>: 讓機器人代替你說話'
            )
            .setTimestamp()

        const modEm = new EmbedBuilder()
            .setTitle('🔒管理 Moderation')
            .setColor('Red')
            .setDescription(
                '> `/ban`: 停權一名成員\n> `/unban`: 解除停權一名成員\n> `/kick`: 踢出一名成員\n> `/timeout`: 禁言一名成員\n> `/purge`: 刪除頻道內訊息\n> `/voice-move`: 移動語音頻道內成員至另一語音頻道\n> `/role`: 編輯成員的身分組'
            )
            .setTimestamp()

        const musicEm = new EmbedBuilder()
            .setTitle('🎶音樂 Music')
            .setColor('Purple')
            .setDescription(
                '> `/play`: 提供連結或關鍵字來播放音樂或影片\n> `/seek`: 調整音樂當前秒數\n> `/settings`: 設定功能\n> `/volume`: 調整音量\n> `/filters`: 增添/刪除音樂過濾器\n> `/jump`: 跳到清單中的歌曲位置'
            )
            .setTimestamp()

        const musicInfoEm = new EmbedBuilder()
            .setColor('Orange')
            .setDescription(
                '`遇到音樂中斷?` -> 可能是以下原因:\n- 機器人重啟\n- 我們正在進行一些修復或更新\n- 網路不穩\n造成你的不便，敬請見諒!'
            )

        const giveEm = new EmbedBuilder()
            .setTitle('🎁抽獎 Giveaway')
            .setColor('Gold')
            .setDescription(
                '> `/start`: 設定一次抽獎活動\n> `/actions`: 設定抽獎活動(結束、暫停、繼續、重抽、刪除)\n> `/edit`: 重新設定參數(時間、獎品等)'
            )
            .setTimestamp()

        const funEm = new EmbedBuilder()
            .setTitle('🎭娛樂 Fun')
            .setColor('Orange')
            .setDescription(
                '> `/anime`: 搜尋動漫資訊\n> `/bite`: 咬某人一口(gif)\n> `/dance`: 挑一支舞(gif)\n> `/hug`: 擁抱某人(gif)\n> `/kill`: 殺掉某人(gif)\n> `/kiss`: 親某人一口(gif)\n> `/pat`: 摸某人一下(gif)\n> `/punch`: 揍某人一拳(gif)\n> `/rock-paper-scissors`: 邀請某人遊玩剪刀石頭布'
            )
            .setTimestamp()

        const value = i.values[0]

        if (value === 'Utilities') {
            await i.update({
                embeds: [publicEm],
                components: [helpMenu, inviteMe, generalCommands]
            })
        } else if (value === 'Moderation') {
            await i.update({
                embeds: [modEm],
                components: [helpMenu, inviteMe, generalCommands]
            })
        } else if (value === 'Music') {
            await i.update({
                embeds: [musicInfoEm, musicEm],
                components: [helpMenu, inviteMe, generalCommands]
            })
        } else if (value === 'Giveaway') {
            await i.update({
                embeds: [giveEm],
                components: [helpMenu, inviteMe, generalCommands]
            })
        } else if (value === 'Fun') {
            await i.update({
                embeds: [funEm],
                components: [helpMenu, inviteMe, generalCommands]
            })
        }
    }
}
