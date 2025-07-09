import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction
} from 'discord.js'

export default {
    id: 'helpMenu',
    async execute(interaction: StringSelectMenuInteraction) {
        const helpMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
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

        const back = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('helpBack')
                .setLabel('返回')
                .setStyle(ButtonStyle.Primary)
        )

        const inviteAndSupport = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setLabel('邀請我')
                .setStyle(ButtonStyle.Link)
                .setURL(
                    'https://discord.com/api/oauth2/authorize?client_id=869166906765103135&permissions=1644971945463&scope=bot%20applications.commands'
                ),
            new ButtonBuilder()
                .setLabel('支援伺服器')
                .setStyle(ButtonStyle.Link)
                .setURL('https://discord.gg/6qCTEer4pT')
        )

        const koFi = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setLabel('請我喝杯咖啡')
                .setEmoji('<:kofi:1308733627496009738>')
                .setStyle(ButtonStyle.Link)
                .setURL('https://ko-fi.com/paper1988')
        )

        const Public = new EmbedBuilder()
            .setTitle('🔧一般 General')
            .setColor('Green')
            .setDescription(
                /*
                > </ai chat-gpt:1345607154291314740> <提示> - 使用由GPT-4o驅動的語言模型來進行互動
                > <:text1:1265167336109899786> </ai prodia:1345607154291314740> <提示> [負向提示] [數量] 使用由Prodia驅動的圖像生成器
                 */
                `
                > </afk set:1131066239050063987> <對外顯示狀態> - 進入AFK(掛機)狀態(當你在進入AFK狀態後在任何頻道中發送文字時，你將自動離開AFK狀態)
                > <:text1:1265167336109899786> </afk return:1131066239050063987> - 離開AFK(掛機)狀態
                > </botinfo:1131066238915842060> - 顯示Paper的資訊
                > </credits:1202478482316329031> - 檢視版權資訊
                > </feedback:1350438795945709639> <Bug | 建議 | 其他> <文字敘述> [造成bug的指令] [圖片] - 請盡可能使用最詳細的敘述來回報bug或提供建議給我們
                > </help:1131066238915842059> - 顯示所有指令的使用方法及用途
                > </invite:1131066238915842058> - 顯示Paper的邀請指令
                > </mcstats:1202453198078738525> - 顯示一個Minecraft伺服器的資訊
                > </ping:1131066238777426001> - 查看機器人延遲
                > </serverinfo:1131066238777426000> - 顯示伺服器的各類資訊
                > </say:1203269049610539089> <內容> - 讓機器人代替你發言
                > </translate:1131066238915842062> <語言> <文字> - 翻譯各國語言(如想有更多語言的需求，請使用</feedback:1350438795945709639>來建議)
                > </userinfo:1131066238777425998> [用戶] - 取得一位用戶的資訊
                `
            )
            .setFooter({ text: '<>內為必填內容，[]內為選填內容' })
            .setTimestamp()

        const mod = new EmbedBuilder()
            .setTitle('🔒管理 Moderation')
            .setColor('Red')
            .setDescription(
                `
                > </anti-alt setup:1131066239050063983> <日誌紀錄頻道> - 設定自動踢出小號(即未滿7日之帳號)系統
                > <:text1:1265167336109899786> </anti-alt reset:1131066239050063983> - 關閉自動踢出小號系統
                > </announce:1131066238777425997> <標題欄> <敘述欄> [顏色(請提供色碼)] [頁腳] [時間戳?] [標註(@everyone/@here)] - 透過機器人來製作嵌入式訊息公告
                > </ban:1131066238777425996> <用戶> <原因> - 停權一名成員
                > </unban:1126091023806902292> - 解除停權一名成員
                > </kick:1131066238777425994> <用戶> - 踢出一名成員
                > </timeout:1126091658962940036> <用戶> <時長(d h m s)> - 禁言一名成員
                > </voice-move:1172819081502658590> <目標頻道> [用戶] - 移動語音頻道內成員至另一語音頻道
                > </role-editor:1131066238777425992> <身分組> [用戶] - 編輯成員的身分組
                > </purge all:1131066238915842067> <數量> - 刪除頻道內指定數量的訊息
                > <:text2:1264894818224574505> </purge user:1131066238915842067> <數量> <用戶> - 刪除用戶在頻道內發送的指定數量的訊息
                > <:text1:1265167336109899786> </purge bot:1131066238915842067> <數量> - 刪除所有機器人發送的指定數量的訊息
                `
            )
            .setFooter({ text: '<>內為必填內容，[]內為選填內容' })
            .setTimestamp()

        const music = new EmbedBuilder()
            .setTitle('🎶音樂 Music')
            .setColor('Purple')
            .setDescription(
                `
                支援 Spotify、SoundCloud、Apple Music、Tidal、Deezer、Bandlab等網站。
                > </music play:1131066239050063988> <搜尋文字> [跳過?] [歌曲插入位置] - 提供連結或關鍵字來播放音樂
                > </music seek:1131066239050063988> <秒數> - 調整當前歌曲播放時間
                > </music settings:1131066239050063988> <選項(↓列在下方↓)> - 音樂設定
                > <:text2:1264894818224574505> 顯示播放佇列
                > <:text2:1264894818224574505> 播放上一首歌
                > <:text2:1264894818224574505> 暫停/恢復播放
                > <:text2:1264894818224574505> 跳過當前歌曲
                > <:text2:1264894818224574505> 打亂清單(隨機播放)
                > <:text2:1264894818224574505> 切換自動播放
                > <:text2:1264894818224574505> 添加一首相似歌曲
                > <:text1:1265167336109899786> 切換重複播放模式 (無 | 單曲循環 | 清單循環)
                > </music volume:1131066239050063988> <音量(數字)> - 調整音量
                > </music filters:1131066239050063988> <過濾器> - 增添/移除音樂過濾器
                > </music jump:1131066239050063988> <歌曲在清單中的位置(數字)> - 跳到指定歌曲在播放清單中的位置(下一首歌請填入1，上一首歌為-1，以此類推)
                `
            )
            .setFooter({ text: '<>內為必填內容，[]內為選填內容' })
            .setTimestamp()

        const playlist = new EmbedBuilder()
            .setTitle('🎶音樂 Music - 播放清單 Playlist')
            .setColor('Purple')
            .setDescription(
                `
                > </playlist-add:1345607154568007731> <播放清單> <歌曲名稱> - 添加歌曲至你的播放清單
                > </playlist-create:1345607154291314748> <播放清單> [私人?] - 創建一個新的播放清單
                > </playlist-delete:1345607154291314747> <播放清單> - 刪除一個播放清單
                > </playlist-edit:1345607154291314746> <播放清單> [新播放清單名稱] [新的清單敘述] [私人?] - 編輯播放清單
                > </playlist-export:1345607154291314745> <播放清單> - 匯出播放清單
                > </playlist-import:1345607154291314744> <檔案> [新播放清單名稱] - 匯入播放清單
                > </playlist-list:1345607154291314743> [播放清單] - 顯示所有播放清單或查看清單資訊
                > </playlist-remove:1345607154291314742> <播放清單> <歌曲在清單中的位置(數字)> - 移除播放清單中的一首歌
                > </playlist-share:1345607154291314741> <播放清單> [私人?] - 分享播放清單
                `
            )
            .setFooter({ text: '<>內為必填內容，[]內為選填內容' })
            .setTimestamp()

        const musicInfo = new EmbedBuilder()
            .setColor('Orange')
            .setDescription(
                '`遇到音樂中斷?` -> 可能是以下原因:\n- 機器人重啟\n- 我們正在進行一些修復或更新\n- 網路不穩'
            )
            .setFooter({ text: '造成不便，敬請見諒!' })

        const giveaway = new EmbedBuilder()
            .setTitle('🎁抽獎 Giveaway')
            .setColor('Gold')
            .setDescription(
                `
                > </giveaway menu:1131066239050063986> - 開啟抽獎系統的選單
                > <:text2:1264894818224574505> - 開始抽獎
                > \t<:text2:1264894818224574505> |選單| - 選擇抽獎活動開始的頻道
                > \t<:text1:1265167336109899786> |表單| - 獎品名稱、數量、時間、備註、限制條件(身分組、加入天數、帳號年齡等)
                > <:text2:1264894818224574505> 查看列表 - 查看正在進行中的抽獎活動
                > <:text2:1264894818224574505> 統計資訊 - 查看此伺服器中所有抽獎活動的統計資訊
                > <:text1:1265167336109899786> 結束抽獎活動
                > </giveaway notification:1131066239050063986> - 設定抽獎活動通知
                `
            )
            .setFooter({ text: '<>內為必填內容，[]內為選填內容' })
            .setTimestamp()

        const giveawayInfo = new EmbedBuilder()
            .setColor('Orange')
            .setDescription(
                '# 請注意:\n### 抽獎活動開始後一個月，未結束的抽獎活動的**__所有資料__**將會被刪除。'
            )
            .setFooter({ text: '造成不便，敬請見諒!' })

        const fun = new EmbedBuilder()
            .setTitle('🎭娛樂 Fun')
            .setColor('Orange')
            .setDescription(
                `
                > </anime:1131066238915842066> <動漫名稱> - 搜尋動漫資訊
                > </gif bite:1265526894007291914> - 咬某人
                > <:text2:1264894818224574505> </gif dance:1265526894007291914> - 跳舞
                > <:text2:1264894818224574505> </gif hug:1265526894007291914> - 擁抱某人
                > <:text2:1264894818224574505> </gif kill:1265526894007291914> - 殺掉某人
                > <:text2:1264894818224574505> </gif kiss:1265526894007291914> - 親吻某人
                > <:text2:1264894818224574505> </gif pat:1265526894007291914> - 摸摸某人
                > <:text1:1265167336109899786> </gif punch:1265526894007291914> - 毆打某人
                > </rock-paper-scissors:1202944172160720968> - 邀請某人一同遊玩剪刀石頭布(rps)
                > </tic-tac-toe:1296259212745113652> - 邀請某人一同遊玩圈圈叉叉(tictactoe)
                `
            )
            .setFooter({ text: '<>內為必填內容，[]內為選填內容' })
            .setTimestamp()

        const value = interaction.values[0]

        switch (value) {
            case 'General':
                {
                    await interaction.update({
                        embeds: [Public],
                        components: [helpMenu, inviteAndSupport, koFi, back]
                    })
                }
                break
            case 'Moderation':
                {
                    await interaction.update({
                        embeds: [mod],
                        components: [helpMenu, inviteAndSupport, koFi, back]
                    })
                }
                break
            case 'Music':
                {
                    await interaction.update({
                        embeds: [musicInfo, music, playlist],
                        components: [helpMenu, inviteAndSupport, koFi, back]
                    })
                }
                break
            case 'Giveaway':
                {
                    await interaction.update({
                        embeds: [giveawayInfo, giveaway],
                        components: [helpMenu, inviteAndSupport, koFi, back]
                    })
                }
                break
            case 'Fun':
                {
                    await interaction.update({
                        embeds: [fun],
                        components: [helpMenu, inviteAndSupport, koFi, back]
                    })
                }
                break
        }
    }
}
