import { AttachmentBuilder, ButtonInteraction, Client, MessageFlags } from 'discord.js'
import { interactionUtils } from '@/libs/utils/interactionUtils.js'

export default {
    id: 'guildlist',
    async execute(interaction: ButtonInteraction, client: Client) {
        if (!interactionUtils.isDeveloper(interaction.user.id)) {
            return interaction.reply({
                content: '這項操作僅限於開發人員使用。',
                flags: MessageFlags.Ephemeral
            })
        }

        const guilds = client.guilds.cache.sort((a, b) => b.memberCount - a.memberCount)

        const description = guilds
            .map((guild) => {
                return `${guild.name} -> ${guild.memberCount} 位成員`
            })
            .join('\n')
        const output = new AttachmentBuilder(Buffer.from(description), {
            name: 'servers.txt'
        })

        await interaction.reply({ files: [output], flags: MessageFlags.Ephemeral })
    }
}
