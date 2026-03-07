import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import emojis from '@/libs/emoji/emoji.js'
import { Logger } from '@/libs/utils/logger.js'
import type { ModalType } from '@/typings/component.js'
import {
    ActionRowBuilder,
    EmbedBuilder,
    MessageFlags,
    ModalSubmitInteraction,
    StringSelectMenuBuilder
} from 'discord.js'
import type { Track } from 'moonlink.js'

export default {
    id: 'addSong',
    async execute(interaction: ModalSubmitInteraction, client: PaperClient) {
        const songName = interaction.fields.getTextInputValue('songName')

        if (!client.moonlink) {
            return interaction.reply({
                content: `${emojis.outage} | 發生未知錯誤`,
                flags: MessageFlags.Ephemeral
            })
        }

        try {
            const select = new StringSelectMenuBuilder()
                .setCustomId('addSong')
                .setPlaceholder('請選擇歌曲')

            const result = await client.moonlink.search({
                query: songName,
                requester: interaction.user
            })

            if (!result.tracks.length) {
                return interaction.reply({
                    content: `${emojis.warning} | 找不到相關的歌曲`,
                    flags: MessageFlags.Ephemeral
                })
            }

            const options = result.tracks
                .slice(0, 25)
                .filter((track: Track) => track.uri)
                .map((track: Track) => {
                    const label =
                        track.title.length > 100
                            ? track.title.substring(0, 97) + '...'
                            : track.title
                    return {
                        label,
                        value: track.uri,
                        description: track.author ? `${track.author}` : undefined
                    }
                })

            if (options.length === 0) {
                return interaction.reply({
                    content: `${emojis.warning} | 找不到有效的歌曲`,
                    flags: MessageFlags.Ephemeral
                })
            }

            select.addOptions(options)

            const Menu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('歌曲搜尋')
                        .setDescription('> 請選擇一首歌曲')
                        .setColor('White')
                ],
                components: [Menu]
            })
        } catch (error: any) {
            Logger.error('搜尋歌曲時發生錯誤:', error.stack)
            await interaction.reply({
                content: `${emojis.outage} | 搜尋歌曲時發生錯誤`,
                flags: MessageFlags.Ephemeral
            })
        }
    }
} satisfies ModalType
