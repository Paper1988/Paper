import emojis from '@/libs/emoji/emoji.js'
import { checkRenameLimit, getManagedChannel, recordRename } from '@/Systems/TempVoice.js'
import type { ModalType } from '@/typings/component.js'
import { MessageFlags, ModalSubmitInteraction } from 'discord.js'

export default {
    id: 'tvRename',
    async execute(interaction: ModalSubmitInteraction) {
        const managed = await getManagedChannel(interaction)
        if (!managed) return
        const { channel } = managed

        // 超過限制時 discord.js 會把請求排隊等好幾分鐘，互動會逾時，所以先擋下來
        const retryAt = checkRenameLimit(channel.id)
        if (retryAt) {
            return await interaction.reply({
                content: `${emojis.warning} | Discord 限制頻道 10 分鐘內只能改名 2 次，請 <t:${Math.ceil(retryAt / 1000)}:R> 再試`,
                flags: MessageFlags.Ephemeral
            })
        }

        const name = interaction.fields.getTextInputValue('name').trim()
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })

        await channel.setName(name)
        recordRename(channel.id)

        return await interaction.editReply({ content: `${emojis.correct} | 頻道名稱已改為 **${name}**` })
    }
} satisfies ModalType
