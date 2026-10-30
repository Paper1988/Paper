import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { deleteMessageAfter } from '@/Systems/Music.js'
import { sendModeratorLog } from '@/Systems/ModeratorLog.js'
import { ButtonInteraction, EmbedBuilder, MessageFlags, PermissionFlagsBits } from 'discord.js'

export default {
    id: 'unbanConfirm',
    async execute(interaction: ButtonInteraction, client: PaperClient) {
        const [, memberId, requesterId] = interaction.customId.split('/')

        if (!interaction.inGuild() || !interaction.guild) {
            return interaction.reply({
                content: '此操作只能在伺服器內執行。',
                flags: MessageFlags.Ephemeral
            })
        }

        if (requesterId !== interaction.user.id) {
            return interaction.reply({
                content: '這個解除封鎖確認視窗不屬於你。',
                flags: MessageFlags.Ephemeral
            })
        }

        if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({
                content: '你目前沒有解除封鎖所需的權限。',
                flags: MessageFlags.Ephemeral
            })
        }

        if (!memberId) {
            return interaction.reply({
                content: '無法取得要解除封鎖的用戶 ID。',
                flags: MessageFlags.Ephemeral
            })
        }

        try {
            const { guild } = interaction
            const processEmbed = new EmbedBuilder()
                .setColor('Blue')
                .setDescription('<a:discord1792loading:1212016238839070791> | 正在執行中...')
                .setFooter({
                    text: client.user!.username,
                    iconURL: client.user!.displayAvatarURL()
                })

            await interaction.update({
                embeds: [processEmbed],
                components: []
            })

            try {
                const user = await client.users.fetch(memberId)
                await guild.members.unban(memberId, `由 ${interaction.user.username} 操作`)
                await sendModeratorLog(interaction, {
                    action: '解除封禁',
                    target: `${user.tag} (${user.id})`,
                    reason: `由 ${interaction.user.tag} 操作`
                })

                const finishedEmbed = new EmbedBuilder()
                    .setColor('Blue')
                    .setDescription(`${user.toString()} (${user.tag}) 已被解除封鎖!`)
                    .setFooter({
                        text: '你可以關閉這個視窗了'
                    })

                await interaction.editReply({
                    embeds: [finishedEmbed],
                    components: []
                })
            } catch (error: any) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(`<:xmark:1265562550947545089> | 解除封鎖失敗: ${error.message}`)
                    .setFooter({
                        text: '請稍後再試'
                    })

                await interaction.editReply({
                    embeds: [errorEmbed],
                    components: []
                })
            }
        } catch (error: any) {
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(`<:xmark:1265562550947545089> | 發生錯誤: ${error.message}`)

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    embeds: [errorEmbed],
                    flags: MessageFlags.Ephemeral
                })
            } else {
                await interaction.reply({
                    embeds: [errorEmbed],
                    flags: MessageFlags.Ephemeral
                }).then(deleteMessageAfter)
            }
        }
    }
}
