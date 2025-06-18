import { deleteMessageAfter } from '@/Systems/Music.js'
import { type Interaction, EmbedBuilder } from 'discord.js'
import { CONFIG } from './interactionUtils.js'

/**
 * 處理 interaction 錯誤
 */
export async function handleInteractionError(error: unknown, interaction: Interaction) {
    console.error(`[Interaction Error]: ${error instanceof Error ? error.stack : error}`)

    const errorMessage = String(error)

    if (errorMessage.includes('DiscordAPIError[10062]: Unknown interaction')) {
        try {
            await interaction.user.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setTitle('發生錯誤')
                        .setDescription(CONFIG.MESSAGES.INTERACTION_EXPIRED)
                ]
            })
        } catch (dmError) {
            console.error('[DM Error]:', dmError)
        }
    } else if (interaction.channel && 'send' in interaction.channel) {
        try {
            const msg = await interaction.channel.send({
                embeds: [
                    new EmbedBuilder().setColor('Red').setDescription(CONFIG.MESSAGES.UNKNOWN_ERROR)
                ]
            })
            deleteMessageAfter(msg, 30 * 1000)
        } catch (sendError) {
            console.error('[Send Error]:', sendError)
        }
    }
}
