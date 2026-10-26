import emojis from '@/libs/emoji/emoji.js'
import { getManagedChannel, transferOwnership } from '@/Systems/TempVoice.js'
import type { MenuType } from '@/typings/component.js'
import type { AnySelectMenuInteraction } from 'discord.js'

export default {
    id: 'tvTransfer',
    async execute(interaction: AnySelectMenuInteraction) {
        if (!interaction.isUserSelectMenu()) return
        const managed = await getManagedChannel(interaction)
        if (!managed) return
        const { channel, record } = managed

        const target = channel.members.get(interaction.values[0]!)
        if (!target || target.user.bot || target.id === record.OwnerID) {
            return await interaction.update({
                content: `${emojis.warning} | 只能轉移給頻道裡的其他成員!`,
                components: []
            })
        }

        await interaction.deferUpdate()
        await transferOwnership(channel, record.OwnerID, target)

        return await interaction.editReply({
            content: `${emojis.correct} | 已將頻道轉移給 ${target}`,
            components: []
        })
    }
} satisfies MenuType
