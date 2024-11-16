const {
    ChatInputCommandInteraction,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    SlashCommandBuilder,
    ButtonStyle,
    Client
} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setNameLocalization('zh-TW', '回報')
        .setNameLocalization('ja', '報告')
        .setDescription('Report bugs and suggestions to the developers')
        .setDescriptionLocalization('zh-TW', '回報Bug、提出建議')
        .setDescriptionLocalization('ja', 'バグや提案を開発者に報告する')
        .addStringOption((options) =>
            options
                .setName('type')
                .setNameLocalization('zh-TW', '類別')
                .setNameLocalization('ja', 'カテゴリ')
                .setDescription('Please choose a type')
                .setDescriptionLocalization('zh-TW', '請選擇類別')
                .setDescriptionLocalization('ja', 'カテゴリを選択してください')
                .setRequired(true)
                .addChoices(
                    {
                        name: '🐞 | Bug',
                        value: 'bug'
                    },
                    {
                        name: '💡 | 建議',
                        value: 'suggestion'
                    },
                    {
                        name: '🌀 | 其他',
                        value: 'other'
                    }
                )
        )
        .addStringOption((options) =>
            options
                .setName('description')
                .setNameLocalization('zh-TW', '描述內容')
                .setNameLocalization('ja', '詳細な内容')
                .setDescription('Please provide the detail of the bugs/suggestions')
                .setDescriptionLocalization('zh-TW', '請提供 Bug、建議的詳細內容')
                .setDescriptionLocalization('ja', 'バグや提案の詳細な内容を入力してください')
                .setRequired(true)
        )
        .addStringOption((options) =>
            options
                .setName('command')
                .setNameLocalization('zh-TW', '指令')
                .setNameLocalization('ja', 'コマンド')
                .setDescription('Which command caused the error?')
                .setDescriptionLocalization('zh-TW', '這是哪個指令造成的bug?')
                .setDescriptionLocalization('ja', 'このバグの原因となるコマンドはどれですか?')
                .setRequired(false)
        )
        .addAttachmentOption((options) =>
            options
                .setName('picture')
                .setNameLocalization('zh-TW', '圖片')
                .setNameLocalization('ja', '写真')
                .setDescription('Please provide a picture of the bug you encountered')
                .setDescriptionLocalization('zh-TW', '請提供圖片')
                .setDescriptionLocalization('ja', '遭遇したバグの写真を提供してください')
                .setRequired(false)
        ),
    usage: '/report <bug|suggest|other> [內容]',
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const type = interaction.options.getString('type')
        const description = interaction.options.getString('description')
        const command = interaction.options.getString('command')
        const picture = interaction.options.getAttachment('picture') || ''
        const guild = interaction.guild

        const sch = client.channels.cache.get('975253353913254029') //''

        const send_m = new EmbedBuilder()
            .setTitle(`<:correct:1265560254708711467> | 你的回報已成功提交!`)
            .setColor('Green')

        const cancel_m = new EmbedBuilder()
            .setTitle(`<:outage:1265561329528471613> | 你的回報提交失敗或取消!`)
            .setColor('Red')

        const send_button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('report:send')
                .setLabel(`提交回報`)
                .setEmoji('<:correct:1265560254708711467>')
                .setStyle(ButtonStyle.Success)
        )
        const cancel_button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('report:cancel')
                .setLabel(`取消`)
                .setEmoji('<:xmark:1265562550947545089>')
                .setStyle(ButtonStyle.Danger)
        )

        const solved_button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('report:solved')
                .setLabel(`標示為已解決`)
                .setEmoji('<:fix:1265269709834813462>')
                .setStyle(ButtonStyle.Primary)
        )

        switch (type) {
            case 'bug':
                {
                    const embed = new EmbedBuilder()
                        .setTitle('<:bug:1265560184722559020> | Bug')
                        .setColor('Red')
                        .setDescription(
                            `提交者: ${interaction.user}(${interaction.user.id})  (伺服器: ${guild.name})`
                        )
                        .addFields(
                            {
                                name: `提供的描述:`,
                                value: `\`\`\`${description}\`\`\``,
                                inline: true
                            },
                            {
                                name: `造成bug的指令:`,
                                value: `\`\`\`${command || `無選擇`}\`\`\``,
                                inline: false
                            }
                        )
                        .setAuthor({
                            name: `${interaction.user.username}`,
                            iconURL: interaction.user.avatarURL()
                        })
                        .setFooter({
                            text: `${guild.name}`,
                            iconURL: guild.iconURL()
                        })
                        .setImage(picture.url)
                        .setTimestamp()

                    const message = await interaction.reply({
                        content: `預覽:`,
                        embeds: [embed],
                        components: [cancel_button, send_button],
                        ephemeral: true
                    })
                    const clr = message.createMessageComponentCollector()

                    clr.on('collect', async (ButtonInteraction) => {
                        if (ButtonInteraction.customId == 'report:send') {
                            const fixed = new EmbedBuilder()
                                .setTitle('Bug已解決')
                                .setDescription(
                                    `<:exclamation:1265560367040299159> | 正如標題所述，你在 ${interaction.createdAt} 回報的Bug已經被開發人員認定為已修復，再次感謝你的回報!`
                                )
                                .setColor('Blurple')
                                .setFooter({
                                    text: `${client.user.username}`,
                                    iconURL: client.user.avatarURL()
                                })
                                .setTimestamp()

                            const msg = await sch.send({
                                embeds: [embed],
                                components: [solved_button]
                            })

                            const collector = msg.createMessageComponentCollector()
                            collector.on('collect', async (i) => {
                                if (i.customId == 'report:solved') {
                                    await i.update({
                                        content: '',
                                        embeds: [embed.setColor('Green')],
                                        components: []
                                    })
                                    await interaction.user.send({
                                        embeds: [fixed]
                                    })
                                }
                            })

                            ButtonInteraction.update({
                                content: '',
                                embeds: [send_m],
                                components: []
                            })
                        }
                    })
                    clr.on('collect', async (ButtonInteraction) => {
                        if (ButtonInteraction.customId == 'report:cancel') {
                            await ButtonInteraction.update({
                                content: '',
                                embeds: [cancel_m],
                                components: []
                            })
                        }
                    })
                }
                break
            case 'suggestion':
                {
                    const embed = new EmbedBuilder()
                        .setTitle('<:bulb:1265560195178958941> | 建議')
                        .setColor('Yellow')
                        .setDescription(
                            `提交者: ${interaction.user}(${interaction.user.id})  (伺服器: ${guild.name})`
                        )
                        .addFields({
                            name: `提供的建議:`,
                            value: `\`\`\`${description}\`\`\``,
                            inline: true
                        })
                        .setAuthor({
                            name: `${interaction.user.username}`,
                            iconURL: interaction.user.avatarURL()
                        })
                        .setFooter({
                            text: `${guild.name}`,
                            iconURL: guild.iconURL()
                        })
                        .setImage(picture.url)
                        .setTimestamp()

                    const message = await interaction.reply({
                        content: `預覽:`,
                        embeds: [embed],
                        components: [cancel_button, send_button],
                        ephemeral: true
                    })
                    const clr = message.createMessageComponentCollector()

                    clr.on('collect', async (ButtonInteraction) => {
                        if (ButtonInteraction.customId == 'report:send') {
                            await sch.send({ embeds: [embed] })
                            ButtonInteraction.update({
                                content: '',
                                embeds: [send_m],
                                components: []
                            })
                        }
                    })
                    clr.on('collect', async (ButtonInteraction) => {
                        if (ButtonInteraction.customId == 'report:cancel') {
                            await ButtonInteraction.update({
                                content: '',
                                embeds: [cancel_m],
                                components: []
                            })
                        }
                    })
                }
                break
            case 'other':
                {
                    const embed = new EmbedBuilder()
                        .setTitle('<:globe:1265560486208864318> | 其他')
                        .setColor('Purple')
                        .setDescription(
                            `提交者: ${interaction.user}(${interaction.user.id})  (伺服器: ${guild.name})`
                        )
                        .addFields({
                            name: `提供的描述:`,
                            value: `\`\`\`${description}\`\`\``,
                            inline: true
                        })
                        .setAuthor({
                            name: `${interaction.user.username}`,
                            iconURL: interaction.user.avatarURL()
                        })
                        .setFooter({
                            text: `${guild.name}`,
                            iconURL: guild.iconURL()
                        })
                        .setImage(picture.url)
                        .setTimestamp()

                    const message = await interaction.reply({
                        content: `預覽:`,
                        embeds: [embed],
                        components: [cancel_button, send_button],
                        ephemeral: true
                    })
                    const clr = message.createMessageComponentCollector()

                    clr.on('collect', async (ButtonInteraction) => {
                        if (ButtonInteraction.customId == 'report:send') {
                            await sch.send({ embeds: [embed] })
                            ButtonInteraction.update({
                                content: '',
                                embeds: [send_m],
                                components: []
                            })
                        }
                    })
                    clr.on('collect', async (ButtonInteraction) => {
                        if (ButtonInteraction.customId == 'report:cancel') {
                            await ButtonInteraction.update({
                                content: '',
                                embeds: [cancel_m],
                                components: []
                            })
                        }
                    })
                }
                break
        }
    }
}
