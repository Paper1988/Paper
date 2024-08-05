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
        .setDescription('回報Bug、提出建議')
        .setDMPermission(false)
        .addStringOption((options) =>
            options.setName('type').setDescription('選擇類別').setRequired(true).addChoices(
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
                .setDescription('請盡你可能使用最詳盡的文字來描述')
                .setRequired(true)
        )
        .addStringOption((options) =>
            options.setName('command').setDescription('這是哪個指令造成的bug?').setRequired(false)
        )
        .addAttachmentOption((options) =>
            options.setName('picture').setDescription('請提供圖片').setRequired(false)
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
            .setTitle(`<:correct_859388130411282442:1201843648229294121> | 你的回報已成功提交!`)
            .setColor('Green')

        const cancel_m = new EmbedBuilder()
            .setTitle(`<:outage_868122243845206087:1202112862990897172> | 你的回報提交失敗或取消!`)
            .setColor('Red')

        const send_button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('report:send')
                .setLabel(`提交回報`)
                .setEmoji('<:correct_859388130411282442:1201843648229294121>')
                .setStyle(ButtonStyle.Success)
        )
        const cancel_button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('report:cancel')
                .setLabel(`取消`)
                .setEmoji('<:xmark_988409378161954866:1201844342029815848>')
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
                        .setTitle('<:bug_859388130803974174:1201843636313280564> | Bug')
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
                                    `<:exclamation_859388127885131796:1222867026805260380> | 正如標題所述，你在 ${interaction.createdAt} 回報的Bug已經被開發人員認定為已修復，再次感謝你的回報!`
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
                        .setTitle('<:buld_882595243579559958:1201843638427209738> | 建議')
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
                        .setTitle('<:globe_859424401971609600:1201843661785284659> | 其他')
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
