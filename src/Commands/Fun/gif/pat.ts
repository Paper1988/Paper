import type { SubCommandType } from '@/typings/command.js'
import {
    ChatInputCommandInteraction,
    ContainerBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    MessageFlags,
    SlashCommandBuilder,
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
    subCommand: 'gif.pat',
    async execute(interaction: ChatInputCommandInteraction) {
        const target = interaction.options.getUser('member', true)
        const executor = interaction.user

        if (target.id === executor.id) {
            return interaction.reply({
                components: [
                    createMessage('# 不可以摸自己！\n換個對象吧。'),
                ],
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            })
        }

        await interaction.reply({
            components: [
                createMessage(`# 摸摸頭\n${executor} 輕輕摸了摸 ${target} 的頭。\n\n正在尋找合適的 GIF…`),
            ],
            flags: MessageFlags.IsComponentsV2,
        })

        try {
            const gifUrl = await getGifUrl('pat')
            if (typeof gifUrl !== 'string' || !URL.canParse(gifUrl)) {
                throw new Error('GIF API returned an invalid URL')
            }

            const container = createMessage(
                `# 摸摸頭\n${executor} 輕輕摸了摸 ${target} 的頭。`,
            ).addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems(
                    new MediaGalleryItemBuilder().setURL(gifUrl),
                ),
            )

            await interaction.editReply({ components: [container] })
        } catch (error) {
            console.error('[gif.pat] Failed to fetch GIF:', error)
            await interaction.editReply({
                components: [
                    createMessage(
                        `# 摸摸頭\n${executor} 想摸摸 ${target}，但 GIF 暫時找不到了。請稍後再試。`,
                    ),
                ],
            })
        }
    },
} as SubCommandType
