import type { PaperClient } from '@/classes/PaperClient'
import emojis from '@/libs/emoji/emoji'
import { deleteMessageAfter } from '@/Systems/Music'
import type { ButtonType } from '@/typings/component'
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    GuildMember,
    MessageFlags,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    TextChannel
} from 'discord.js'

export function createFilterComponents(client: PaperClient) {
    const filters = new StringSelectMenuBuilder()
        .setCustomId('filters')
        .setPlaceholder('請選擇過濾器')
        .setMinValues(1)

    for (const filter in client.distube.filters) {
        filters.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel(filter)
                .setDescription(`增加/移除 ${filter}`)
                .setValue(filter)
        )
    }

    const selectMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents([filters])

    const button = new ActionRowBuilder<ButtonBuilder>().addComponents([
        new ButtonBuilder()
            .setLabel('全部關閉')
            .setCustomId('false')
            .setEmoji('<:xmark:1265562550947545089>')
            .setStyle(ButtonStyle.Danger)
    ])

    return [selectMenu, button] as const
}

export default {
    id: 'filters',
    async execute(interaction: ButtonInteraction, client: PaperClient) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })
        if (!interaction.member || !(interaction.member instanceof GuildMember)) {
            return interaction.editReply({
                content: '此命令只能在伺服器中使用！'
            })
        }

        if (!interaction.channel || !(interaction.channel instanceof TextChannel)) {
            return interaction.editReply({
                content: '此命令只能在伺服器文字頻道中使用！'
            })
        }
        const member = interaction.member
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel) {
            return await interaction
                .editReply({
                    content: `${emojis.warning} | 你必須待在語音頻道裡面才能使用音樂按鈕!`
                })
                .then((msg) => deleteMessageAfter(msg, 10 * 1000))
        }

        const currentVoiceChannel = interaction.guild?.members.me?.voice.channelId
        if (currentVoiceChannel && VoiceChannel.id !== currentVoiceChannel) {
            return await interaction.editReply({
                content: `${emojis.warning} | 我已經在語音頻道 - <#${currentVoiceChannel}> 裡播放音樂了`
            })
        }

        const queue = client.distube.getQueue(VoiceChannel)
        if (!queue) {
            return await interaction
                .editReply({
                    content: `${emojis.outage} | 找不到歌曲或該歌曲已經播放完畢!`
                })
                .then((msg) => deleteMessageAfter(msg, 10 * 1000))
        }

        await interaction.editReply({
            content: '<:spark:1265561903195750471> | 請選擇過濾器',
            components: createFilterComponents(client)
        })
    }
} satisfies ButtonType
