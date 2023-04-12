const {SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
      .setName("help")
      .setDescription("顯示完整的指令列表"),
    async execute(interaction) {
        const helpmenu = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("menu")
                .setPlaceholder("選擇一個分類")
                .addOptions(
                    {
                        label: "🔧功能",
                        description: "顯示所有功能指令",
                        value: "menu1"
                    },

                    {
                        label: "🔒管理",
                        description: "顯示所有管理指令(只有管理員和版主等人可以使用)",
                        value: "menu2"
                    },

                    {
                        label: "🎶音樂",
                        description: "顯示所有音樂指令",
                        value: "menu3"
                    },
                ),
        );

        const funbutton = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("funbutton")
                .setLabel("娛樂指令")
                .setStyle(ButtonStyle.Secondary)
        )

        const generalcommands = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("back")
                .setLabel("返回")
                .setStyle(ButtonStyle.Primary)
        )

        const inviteme = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setLabel("邀請我")
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.com/api/oauth2/authorize?client_id=869166906765103135&permissions=1644971945463&scope=bot%20applications.commands")
        )


        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setDescription("Paper是一個多功能機器人，有許多指令，像是：音樂、抽獎、管理以及更多有趣的指令等你來發現！")
            .setTimestamp()
        
        const publicem = new EmbedBuilder()
            .setColor("Green")
            .setDescription("`/help`: 顯示這個列表\n`/botinfo`: 顯示有關Paper的資訊\n`/ping`: Pong!\n`/invite`: 顯示Paper的邀請指令\n`/status`: 檢查機器人的狀態\n`/serverinfo`: 顯示伺服器的資訊\n`/userinfo`: 取得一位用戶的資訊")
            .setTimestamp()
        
        const funem = new EmbedBuilder()
            .setColor("Yellow")
            .setDescription("`/tweet`: fake-tweets a post\n`/meme`: Generates a random meme\n`/pixelate`: Pixelate a usre's avatar\n`/slap`: Slaps a user")
            .setTimestamp()
        
        const modem = new EmbedBuilder()
            .setColor("Red")
            .setDescription("\`/ban\`: Bans a user\n\`/unban\`: Unbans a user\n\`/kick\`: Kicks a user\n\`/mute\`: Mutes a user\n`/unmute`: Unmutes a user\n`/purge`: Purges specific numbers of messages\n`/setup-logs`: Setups log channel in your server\n`/warnings add`: Add warnings to a user\n`/warnings check`: Checks numbers of warnings a user have\n`/warnings remove`: Clears a specific number of warns from a user\n`/warnings clear`: Clear all warns from a user")
            .setTimestamp()
        
        const musicem = new EmbedBuilder()
            .setColor("Purple")
            .setDescription(
							"\`/play\`: 提供連結或關鍵字來播放音樂或影片\n\`/seek\`: Forwards a music\n\`/settings\`: \`\`\n\`/volume\`: Change the volume"
						)
            .setTimestamp()

        const message = await interaction.reply({ embeds: [embed], components: [helpmenu, inviteme]})

        const collector = await message.createMessageComponentCollector()

        collector.on(`collect`, async (i) => {
            if (i.customId === 'menu') {
                const value = i.values[0];
                if (i.user.id !== interaction.user.id) {
                    return await i.reply({ content: `只有 ${interaction.user.tag} 才能使用這個選單!`, ephemeral: true})
                }
                if (value === "menu1") {
                    await i.update({embeds: [publicem], components: [helpmenu, funbutton, inviteme]})
                }

                if (value === "menu2") {
                    await i.update({embeds: [modem], components: [helpmenu, inviteme]})
                }

                if (value === "menu3") {
                    await i.update({embeds: [musicem], components: [helpmenu, inviteme]})
                }
            }

            if (i.customId === "funbutton") {
                if (i.user.id !== interaction.user.id) {
                    return await i.reply({ content: `只有 ${interaction.user.tag} 可以使用這些按鈕!`, ephemeral: true})
                }
                await i.update({embeds: [funem], components: [helpmenu, generalcommands, inviteme]})
            }

            if (i.customId === "back") {
                if (i.user.id !== interaction.user.id) {
                    return await i.reply({ content: `只有 ${interaction.user.tag} 可以使用這些按鈕!`, ephemeral: true})
                }
                await i.update({embeds: [publicem], components: [helpmenu, funbutton, inviteme]})
            }

        })
    }
}