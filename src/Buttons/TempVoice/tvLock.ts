import { buildPanel, getManagedChannel, isLocked } from '@/Systems/TempVoice.js'
import type { ButtonType } from '@/typings/component.js'
import type { ButtonInteraction } from 'discord.js'

export default {
    id: 'tvLock',
    async execute(interaction: ButtonInteraction) {
        const managed = await getManagedChannel(interaction)
        if (!managed) return
        const { channel, record } = managed

        await interaction.deferUpdate()

        const locked = isLocked(channel)
        // 已在頻道內的人不會被踢出，只是新的人進不來
        await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
            Connect: locked ? null : false
        })

        // permissionOverwrites.edit 不會立刻更新快取，所以直接傳入新狀態
        await interaction.editReply(buildPanel(channel, record.OwnerID, !locked))
    }
} satisfies ButtonType
