/* import ApexChat from 'apexify.js' */
import type { SubCommandType } from '@/typings/command'
import { ChatInputCommandInteraction, /* EmbedBuilder, */ MessageFlags } from 'discord.js'

export default {
    subCommand: 'ai.chat-gpt',
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })

        const prompt = interaction.options.getString('prompt')

        return interaction.editReply({
            content: '這個指令正在修復中，無法使用。'
        })

        /* const embed = new EmbedBuilder()
            .setColor('Aqua')
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.avatarURL()!
            })
            .setFooter({ text: '由 GPT-4o 驅動' })

        await ApexChat('gpt-4o', prompt, {
            userId: interaction.user.id,
            memory: true,
            instruction: `你是一個負責在Discord上名為: ${interaction.guild!.name} 的伺服器中服務名為: ${interaction.user.username} 的用戶的機器人，請你全程使用繁體中文回答和處理 ${interaction.user.username} 的請求。`
        })
            .then(
                async (response) =>
                    await interaction.editReply({
                        embeds: [embed.setDescription(response)]
                    })
            )
            .catch((err) => {
                interaction.editReply({
                    embeds: [
                        embed
                            .setDescription('<:outage:1265561329528471613> | ' + err)
                            .setColor('Red')
                    ]
                })
                console.log(err)
            }) */
    }
} as SubCommandType
