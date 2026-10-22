import Giveaway from '@/Structures/Schemas/Giveaway.js'
import type { ButtonType } from '@/typings/component.js'
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder
} from 'discord.js'

const ACCENT_COLOR = 0xA3A3A3
const DISPLAY_LIMIT = 10

function createListEmbed(giveaways: Awaited<ReturnType<typeof Giveaway.find>>) {
    const description = giveaways.map((giveaway, index) => [
        '**' + (index + 1) + '. ' + giveaway.prize + '**',
        '參加人數：' + giveaway.participants.length + ' · 得獎名額：' + giveaway.winnerCount,
        '截止：<t:' + Math.floor(giveaway.endAt.getTime() / 1000) + ':R> · 主持人：<@' + giveaway.hostedBy + '>',
        '[前往活動](https://discord.com/channels/' + giveaway.guildId + '/' + giveaway.channelId + '/' + giveaway.messageId + ')'
    ].join('\n')).join('\n\n')

    return new EmbedBuilder()
        .setColor(ACCENT_COLOR)
        .setTitle('進行中的抽獎')
        .setDescription(description || '目前沒有進行中的抽獎。')
        .setFooter({ text: giveaways.length === DISPLAY_LIMIT ? '顯示最早結束的 10 個活動' : 'Paper Giveaway' })
}

export default {
    id: 'giveaway-refresh',
    async execute(interaction: ButtonInteraction) {
        const giveaways = await Giveaway.find({
            guildId: interaction.guildId,
            ended: false
        })
            .sort({ endAt: 1 })
            .limit(DISPLAY_LIMIT)

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('giveaway-refresh')
                .setLabel('重新整理')
                .setEmoji('↻')
                .setStyle(ButtonStyle.Secondary)
        )

        await interaction.update({
            embeds: [createListEmbed(giveaways)],
            components: [row]
        })
    }
} satisfies ButtonType
