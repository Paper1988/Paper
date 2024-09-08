const {
    StringSelectMenuInteraction,
    ActionRowBuilder,
    ButtonStyle,
    EmbedBuilder,
    ButtonBuilder,
    StringSelectMenuBuilder
} = require('discord.js')

module.exports = {
    id: 'helpMenu',
    /**
     * @param {StringSelectMenuInteraction} interaction
     */
    async execute(interaction) {
        const helpMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('helpMenu')
                .setPlaceholder('選擇一個分類')
                .addOptions(
                    {
                        label: '🔧功能',
                        description: '顯示所有功能指令',
                        value: 'General'
                    },

                    {
                        label: '🔒管理',
                        description: '顯示所有管理指令(只有管理員和版主等人可以使用)',
                        value: 'Moderation'
                    },

                    {
                        label: '🎶音樂',
                        description: '顯示所有音樂指令',
                        value: 'Music'
                    },

                    {
                        label: '🎁抽獎',
                        description: '顯示所有抽獎指令',
                        value: 'Giveaway'
                    },

                    {
                        label: '🎭 娛樂',
                        description: '顯示所有娛樂指令',
                        value: 'Fun'
                    }
                )
        )
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
                    'https://discord.com/api/oauth2/authorize?client_id=869166906765103135&permissions=1644971945463&scope=bot%20applications.commands'
                )
        )

        const publicEm = new EmbedBuilder()
            .setTitle('🔧一般 General')
            .setColor('Green')
            .setDescription(
                `
                > </afk set:1131066239050063987> <對外顯示狀態> 進入AFK(掛機)狀態(當你在進入AFK狀態後在任何頻道中發送文字時，你將自動離開AFK狀態)
                > <:text1:1265167336109899786> </afk return:1131066239050063987> 離開AFK(掛機)狀態
                > </botinfo:1131066238915842060> 顯示有關Paper的資訊
                > </credits:1202478482316329031> 檢視版權資訊
                > </help:1131066238915842059> 顯示所有指令的使用方法及用途
                > </invite:1131066238915842058> 顯示Paper的邀請指令
                > </mcstats:1202453198078738525> 顯示一個Minecraft伺服器的資訊
                > </ping:1131066238777426001> 查看機器人延遲
                > </report:1158752288928710706> <Bug | 建議 | 其他> <文字敘述> [造成bug的指令] [圖片] 請盡你可能使用最詳盡的文字來回報bug或提供建議給我們
                > </serverinfo:1131066238777426000> 顯示伺服器的各類資訊
                > </say:1203269049610539089> <內容> 讓機器人代替你發言
                > </translate:1131066238915842062> <語言> <文字> 翻譯各國語言(如想有更多語言的需求，請使用</report:1158752288928710706>來建議)
                > </userinfo:1131066238777425998> [用戶] 取得一位用戶的資訊
                `
            )
            .setFooter({ text: '<>內為必填內容，[]內為選填內容' })
            .setTimestamp()

        const modEm = new EmbedBuilder()
            .setTitle('🔒管理 Moderation')
            .setColor('Red')
            .setDescription(
                `
                > </anti-alt setup:1131066239050063983> <日誌紀錄頻道> 設定自動踢出小號(即未滿7日之帳號)系統
                > <:text1:1265167336109899786> </anti-alt reset:1131066239050063983> 關閉自動踢出小號系統
                > </announce:1131066238777425997> <標題欄> <敘述欄> [顏色(請提供色碼)] [頁腳] [時間戳?] [標註(@everyone/@here)] 透過機器人來幫你製作一個嵌入式訊息公告
                > </ban:1131066238777425996> <用戶> <原因> 停權一名成員
                > </unban:1126091023806902292> 解除停權一名成員
                > </kick:1131066238777425994> <用戶> 踢出一名成員
                > </timeout:1126091658962940036> <用戶> <時長(d h m s)> 禁言一名成員
                > </voice-move:1172819081502658590> <目標頻道> [用戶] 移動語音頻道內成員至另一語音頻道
                > </role-editor:1131066238777425992> <身分組> [用戶] 編輯成員的身分組
                > </purge all:1131066238915842067> <數量> 刪除頻道內指定數量的訊息
                > <:text2:1264894818224574505> </purge user:1131066238915842067> <數量> <用戶> 刪除用戶在頻道內發送的指定數量的訊息
                > <:text1:1265167336109899786> </purge bot:1131066238915842067> <數量> 刪除所有機器人發送的指定數量的訊息
                `
            )
            .setFooter({ text: '<>內為必填內容，[]內為選填內容' })
            .setTimestamp()

        const musicEm = new EmbedBuilder()
            .setTitle('🎶音樂 Music')
            .setColor('Purple')
            .setDescription(
                `
                > </music play:1131066239050063988> <搜尋文字> [跳過?] [歌曲插入位置] 提供連結或關鍵字來播放音樂
                > </music seek:1131066239050063988> <秒數> 調整當前歌曲播放時間
                > </music settings:1131066239050063988> <選項(↓列在下方↓)> 音樂設定
                > <:text2:1264894818224574505> 顯示播放清單
                > <:text2:1264894818224574505> 播放上一首歌
                > <:text2:1264894818224574505> 暫停/恢復播放
                > <:text2:1264894818224574505> 跳過當前歌曲
                > <:text2:1264894818224574505> 打亂清單(隨機播放)
                > <:text2:1264894818224574505> 切換自動播放
                > <:text2:1264894818224574505> 添加一首相似歌曲
                > <:text1:1265167336109899786> 切換重複播放模式 (無 | 單曲循環 | 清單循環)
                > </music volume:1131066239050063988> <音量(數字)> 調整音量
                > </music filters:1131066239050063988> <過濾器> 增添/移除音樂過濾器
                > </music jump:1131066239050063988> <歌曲在清單中的位置(數字)> 跳到指定歌曲在播放清單中的位置(下一首歌請填入1，上一首歌為-1，以此類推)
                `
            )
            .setFooter({ text: '<>內為必填內容，[]內為選填內容' })
            .setTimestamp()

        const musicInfoEm = new EmbedBuilder()
            .setColor('Orange')
            .setDescription(
                '`遇到音樂中斷?` -> 可能是以下原因:\n- 機器人重啟\n- 我們正在進行一些修復或更新\n- 網路不穩'
            )
            .setFooter({ text: '造成不便，敬請見諒!' })

        const giveEm = new EmbedBuilder()
            .setTitle('🎁抽獎 Giveaway')
            .setColor('Gold')
            .setDescription(
                `
                > </giveaway start:1131066239050063986> <結束時間(d h m s)> <獎品> [贏家數量] [舉辦頻道] [drop?] [橫幅圖片] [身分組] 開始一個抽獎活動
                > </giveaway actions:1131066239050063986> <結束|暫停|繼續|重抽|刪除> <訊息ID> 設定抽獎活動
                > </giveaway edit:1131066239050063986> <訊息ID> [新時間(d h m s)] [新贏家數] [新獎品] [新橫幅圖片] [新身分組]  更新抽獎活動的參數
                `
            )
            .setFooter({ text: '<>內為必填內容，[]內為選填內容' })
            .setTimestamp()

        const funEm = new EmbedBuilder()
            .setTitle('🎭娛樂 Fun')
            .setColor('Orange')
            .setDescription(
                `
                > </anime:1131066238915842066> <動漫名稱> 搜尋動漫資訊
                > </gif bite:1265526894007291914> 咬某人
                > <:text2:1264894818224574505> </gif dance:1265526894007291914> 跳舞
                > <:text2:1264894818224574505> </gif hug:1265526894007291914> 擁抱某人
                > <:text2:1264894818224574505> </gif kill:1265526894007291914> 殺掉某
                > <:text2:1264894818224574505> </gif kiss:1265526894007291914> 親吻某人
                > <:text2:1264894818224574505> </gif pat:1265526894007291914> 摸摸某人
                > <:text1:1265167336109899786> </gif punch:1265526894007291914> 揍打某人
                > </rock-paper-scissors:1202944172160720968> 邀請某人遊玩剪刀石頭布
                `
            )
            .setFooter({ text: '<>內為必填內容，[]內為選填內容' })
            .setTimestamp()

        const value = interaction.values[0]

        switch (value) {
            case 'General':
                {
                    await interaction.update({
                        embeds: [publicEm],
                        components: [helpMenu, inviteMe, generalCommands]
                    })
                }
                break
            case 'Moderation':
                {
                    await interaction.update({
                        embeds: [modEm],
                        components: [helpMenu, inviteMe, generalCommands]
                    })
                }
                break
            case 'Music':
                {
                    await interaction.update({
                        embeds: [musicInfoEm, musicEm],
                        components: [helpMenu, inviteMe, generalCommands]
                    })
                }
                break
            case 'Giveaway':
                {
                    await interaction.update({
                        embeds: [giveEm],
                        components: [helpMenu, inviteMe, generalCommands]
                    })
                }
                break
            case 'Fun':
                {
                    await interaction.update({
                        embeds: [funEm],
                        components: [helpMenu, inviteMe, generalCommands]
                    })
                }
                break
        }
    }
}
