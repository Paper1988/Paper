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
    subCommand: 'gif.smile',
    async execute(interaction: ChatInputCommandInteraction) {
        const executor = interaction.user

        await interaction.reply({
            components: [createMessage(`# 微笑\n${executor} 正在準備微笑…\n\n正在尋找合適的 GIF…`)],
            flags: MessageFlags.IsComponentsV2,
        })

        try {
            const gifUrl = await getGifUrl('smile')
            if (!URL.canParse(gifUrl) || !/^https?:$/.test(new URL(gifUrl).protocol)) {
                throw new Error('GIF API returned an invalid URL')
            }

            const container = createMessage(`# 微笑\n${executor} 露出了一個微笑。`).addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems(
                    new MediaGalleryItemBuilder().setURL(gifUrl),
                ),
            )
            await interaction.editReply({ components: [container] })
        } catch (error) {
            console.error('[gif.smile] Failed to fetch GIF:', error)
            await interaction.editReply({
                components: [createMessage('# 微笑\nGIF 暫時找不到了，請稍後再試。')],
            })
        }
    },
} as SubCommandType
