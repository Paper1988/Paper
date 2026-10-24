import Giveaway from '@/Structures/Schemas/Giveaway.js'
import type { ButtonType } from '@/typings/component.js'
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ContainerBuilder,
    MessageFlags,
    TextDisplayBuilder
} from 'discord.js'

const ACCENT_COLOR = 0xA3A3A3
const DISPLAY_LIMIT = 10

function createListPanel(giveaways: Awaited<ReturnType<typeof Giveaway.find>>) {
    const description = giveaways.map((giveaway, index) => [
        '**' + (index + 1) + '. ' + giveaway.prize + '**',
        '參加人數：' + giveaway.participants.length + ' · 得獎名額：' + giveaway.winnerCount,
        '截止：<t:' + Math.floor(giveaway.endAt.getTime() / 1000) + ':R> · 主持人：<@' + giveaway.hostedBy + '>',
        '活動 ID：`' + giveaway.messageId + '`',
        '[前往活動](https://discord.com/channels/' + giveaway.guildId + '/' + giveaway.channelId + '/' + giveaway.messageId + ')'
    ].join('\n')).join('\n\n')

    return new ContainerBuilder()
        .setAccentColor(ACCENT_COLOR)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent([
                '# 進行中的抽獎',
                description || '目前沒有進行中的抽獎。',
                '',
                '-# ' + (giveaways.length === DISPLAY_LIMIT ? '顯示最早結束的 10 個活動' : 'Paper Giveaway')
            ].join('\n'))
        )
}

function createRefreshButton() {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('giveaway-refresh')
            .setLabel('重新整理')
            .setEmoji('🔄')
            .setStyle(ButtonStyle.Secondary)
    )
}

export default {
    id: 'giveaway-list',
    async execute(interaction: ButtonInteraction) {
        const giveaways = await Giveaway.find({
            guildId: interaction.guildId,
            ended: false
        })
            .sort({ endAt: 1 })
            .limit(DISPLAY_LIMIT)

        await interaction.reply({
            components: [createListPanel(giveaways), createRefreshButton()],
            flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
        })
    }
} satisfies ButtonType
