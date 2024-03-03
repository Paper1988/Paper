const {
    ChatInputCommandInteraction,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    SlashCommandBuilder
} = require('discord.js')
const client = require('../../../index.js') // - path to your index.js, you need to have ( module.exports = client; ) in your index.js

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('回報給我們訊息')
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
                .setDescription('請盡可能清楚地描述你遭遇的bug或你想提供的建議')
                .setRequired(true)
        )
        .addStringOption((options) =>
            options
                .setName('command')
                .setDescription('這是哪個指令造成的bug?\n若是建議則不需要填')
                .setRequired(false)
        )
        .addAttachmentOption((options) =>
            options.setName('picture').setDescription('新增圖片').setRequired(false)
        ),
    usage: '/report [內容]',
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const type = interaction.options.getString('type')
        const description = interaction.options.getString('description')
        const command = interaction.options.getString('command')
        const picture = interaction.options.getAttachment('picture') || ''
        const guild = interaction.guild

        const sch = client.channels.cache.get('975253353913254029')

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
                .setStyle('Success')
        )
        const cancel_button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('report:cancel')
                .setLabel(`取消`)
                .setEmoji('<:xmark_988409378161954866:1201844342029815848>')
                .setStyle('Danger')
        )

        switch (type) {
            case 'bug':
                {
                    const B_embed = new EmbedBuilder()
                        .setTitle('<:bug_859388130803974174:1201843636313280564> | Bug')
                        .setColor('Red')
                        .setDescription(`提交者: ${interaction.user}  (伺服器: ${guild.name})`)
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
                        .setThumbnail(picture.url)
                        .setTimestamp()

                    const Bmessage = await interaction.reply({
                        content: `預覽:`,
                        embeds: [B_embed],
                        components: [cancel_button, send_button],
                        ephemeral: true
                    })
                    const clr = Bmessage.createMessageComponentCollector()

                    clr.on('collect', async (ButtonInteraction) => {
                        if (ButtonInteraction.customId == 'report:send') {
                            await sch.send({ embeds: [B_embed] })
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
                    const S_embed = new EmbedBuilder()
                        .setTitle('<:buld_882595243579559958:1201843638427209738> | 建議')
                        .setColor('Yellow')
                        .setDescription(`提交者: ${interaction.user}  (伺服器: ${guild.name})`)
                        .addFields({
                            name: `提供的敘述:`,
                            value: `\`\`\`${description}\`\`\``,
                            inline: true
                        })
                        .setThumbnail(picture.url)
                        .setTimestamp()

                    const Smessage = await interaction.reply({
                        content: `預覽:`,
                        embeds: [S_embed],
                        components: [cancel_button, send_button],
                        ephemeral: true
                    })
                    const clr = Smessage.createMessageComponentCollector()

                    clr.on('collect', async (ButtonInteraction) => {
                        if (ButtonInteraction.customId == 'report:send') {
                            await sch.send({ embeds: [S_embed] })
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
                    const O_embed = new EmbedBuilder()
                        .setTitle('<:globe_859424401971609600:1201843661785284659> | 其他')
                        .setColor('Purple')
                        .setDescription(`提交者: ${interaction.user}  (伺服器: ${guild.name})`)
                        .addFields({
                            name: `提供的描述:`,
                            value: `\`\`\`${description}\`\`\``,
                            inline: true
                        })
                        .setThumbnail(picture.url)
                        .setTimestamp()

                    const Omessage = await interaction.reply({
                        content: `預覽:`,
                        embeds: [O_embed],
                        components: [cancel_button, send_button],
                        ephemeral: true
                    })
                    const clr = Omessage.createMessageComponentCollector()

                    clr.on('collect', async (ButtonInteraction) => {
                        if (ButtonInteraction.customId == 'report:send') {
                            await sch.send({ embeds: [O_embed] })
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
