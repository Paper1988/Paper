import type { PaperClient } from '@/classes/PaperClient.js'
import { ButtonInteraction, EmbedBuilder, MessageFlags } from 'discord.js'

module.exports = {
    id: 'unbanConfirm',
    async execute(interaction: ButtonInteraction, client: PaperClient) {
        try {
            const memberId = interaction.customId.split('/')[1]
            if (!memberId) {
                throw new Error('無法獲取用戶 ID')
            }

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
                await guild?.members.unban(memberId, `由 ${interaction.user.username} 操作`)

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

            await interaction.reply({
                embeds: [errorEmbed],
                flags: MessageFlags.Ephemeral
            })
        }
    }
}
