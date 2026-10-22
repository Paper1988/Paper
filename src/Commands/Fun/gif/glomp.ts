import type { SubCommandType } from '@/typings/command.js'
import {
    ChatInputCommandInteraction,
    ContainerBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    MessageFlags,
    TextDisplayBuilder,
} from 'discord.js'
import { getGifUrl } from '@/Systems/API/Gif.js'

const ACCENT_COLOR = 0xA3A3A3

function createMessage(content: string) {
    return new ContainerBuilder()
        .setAccentColor(ACCENT_COLOR)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(content))
}

export default {
    subCommand: 'gif.glomp',
    async execute(interaction: ChatInputCommandInteraction) {
        const executor = interaction.user

        const target = interaction.options.getUser('member', true)

        if (target.id === executor.id) {
            return interaction.reply({
                components: [createMessage('# 飛撲\\n不能飛撲自己啦！換個對象吧。')],
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            })
        }

        await interaction.reply({
            components: [createMessage(`# 飛撲\\n${executor} 對 ${target} 做出動作…\\n\\n正在尋找合適的 GIF…`)],
            flags: MessageFlags.IsComponentsV2,
        })

        try {
            const gifUrl = await getGifUrl('glomp')
            if (!URL.canParse(gifUrl) || !/^https?:$/.test(new URL(gifUrl).protocol)) {
                throw new Error('GIF API returned an invalid URL')
            }

            const container = createMessage(`# 飛撲\\n${executor} 飛撲過去抱住了${target}。`).addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems(
                    new MediaGalleryItemBuilder().setURL(gifUrl),
                ),
            )
            await interaction.editReply({ components: [container] })
        } catch (error) {
            console.error('[gif.glomp] Failed to fetch GIF:', error)
            await interaction.editReply({
                components: [createMessage('# 飛撲\\nGIF 暫時找不到了，請稍後再試。')],
            })
        }
    },
} as SubCommandType
