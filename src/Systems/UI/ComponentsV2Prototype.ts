import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    MessageFlags,
    SeparatorBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
    type MessageCreateOptions,
} from 'discord.js'

/**
 * Minimal Components V2 payload used to verify Paper's builder and message flow.
 *
 * Keep this isolated from production UI until the prototype has been tested in
 * a real Discord channel. Components V2 messages must not include legacy
 * `content` or `embeds` fields.
 */
export function buildComponentsV2Prototype(): MessageCreateOptions {
    const container = new ContainerBuilder()
        .setAccentColor(0x5865f2)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent('# Paper UI / Components V2'),
            new TextDisplayBuilder().setContent(
                'This is a small technical prototype for the Paper redesign.\n' +
                    'It verifies container layout, text display, separators, and button payloads.',
            ),
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setDivider(true)
                .setSpacing(SeparatorSpacingSize.Small),
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent('**Prototype status**\nBuilder payload assembled. Live delivery still needs verification.'),
        )
        .addActionRowComponents(
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId('paper-v2-prototype:primary')
                    .setLabel('Primary action')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('paper-v2-prototype:secondary')
                    .setLabel('Secondary')
                    .setStyle(ButtonStyle.Secondary),
            ),
        )

    return {
        flags: MessageFlags.IsComponentsV2,
        components: [container],
    }
}
