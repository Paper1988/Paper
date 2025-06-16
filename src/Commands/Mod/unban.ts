import type { CommandType } from '@/typings/command'
import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
    StringSelectMenuBuilder
} from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setNameLocalization('zh-TW', '解除封鎖')
        .setNameLocalization('ja', 'アンバン')
        .setDescription('Unban a member who was banned from the server')
        .setDescriptionLocalization('zh-TW', '解除封鎖伺服器中被封鎖的成員')
        .setDescriptionLocalization('ja', 'サーバー内のバンされたメンバーを解除します')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction: ChatInputCommandInteraction, client: Client) {
        const guild = interaction.guild!

        const fetchBan = await guild.bans.fetch({ limit: 25 })

        const noBanEmbed = new EmbedBuilder()
            .setColor('Red')
            .setDescription('<:warning:1265562532857380936> | 伺服器中沒有正被封鎖的用戶!')
            .setFooter({
                text: client.user!.username,
                iconURL: client.user!.displayAvatarURL()
            })

        if (fetchBan.size === 0) {
            return await interaction.reply({
                embeds: [noBanEmbed],
                flags: MessageFlags.Ephemeral
            })
        }

        const memberList: any[] = []
        fetchBan.forEach((member) => {
            memberList.push({ label: member.user.username, value: member.user.id })
        })

        const choicesEmbed = new EmbedBuilder()
            .setColor('Blue')
            .setDescription('從下面的列表中選取一位用戶')
            .setFooter({
                text: client.user!.username,
                iconURL: client.user!.displayAvatarURL()
            })

        const selectMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents([
            new StringSelectMenuBuilder()
                .setCustomId('unban:selectMenu')
                .setPlaceholder('選擇一個用戶')
                .addOptions(memberList)
                .setMinValues(1)
                .setMaxValues(1)
        ])

        await interaction.reply({
            embeds: [choicesEmbed],
            components: [selectMenu],
            flags: MessageFlags.Ephemeral
        })
    }
} as CommandType
