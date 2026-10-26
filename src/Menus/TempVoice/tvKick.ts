import emojis from '@/libs/emoji/emoji.js'
import { getManagedChannel } from '@/Systems/TempVoice.js'
import type { MenuType } from '@/typings/component.js'
import type { AnySelectMenuInteraction } from 'discord.js'

export default {
    id: 'tvKick',
    async execute(interaction: AnySelectMenuInteraction) {
        if (!interaction.isUserSelectMenu()) return
        const managed = await getManagedChannel(interaction)
        if (!managed) return
        const { channel, record } = managed

        const targetId = interaction.values[0]!
        if (targetId === record.OwnerID || targetId === interaction.client.user.id) {
            return await interaction.update({
                content: `${emojis.warning} | 不能踢出這位成員!`,
                components: []
            })
        }

        // 禁止重新加入，否則踢出後馬上又能進來
        await channel.permissionOverwrites.edit(targetId, { Connect: false })
        await channel.members.get(targetId)?.voice.disconnect('被臨時頻道擁有者踢出').catch(() => {})

        return await interaction.update({
            content: `${emojis.correct} | 已將 <@${targetId}> 踢出並禁止重新加入`,
            components: []
        })
    }
} satisfies MenuType
