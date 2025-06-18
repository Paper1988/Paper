import type { PaperClient } from '@/classes/PaperClient.js'
import emojis from '@/libs/emoji/emoji.js'
import { deleteMessageAfter } from '@/Systems/Music.js'
import type { ButtonType } from '@/typings/component.js'
import {
    ActionRowBuilder,
    ButtonInteraction,
    GuildMember,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js'

export default {
    id: 'addSong',
    async execute(interaction: ButtonInteraction, client: PaperClient) {
        const member = interaction.member! as GuildMember
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel) {
            return await interaction
                .reply({
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
                .reply({
                    content: `${emojis.warning} | 找不到歌曲或該歌曲已經播放完畢!`
                })
                .then((msg) => deleteMessageAfter(msg, 10 * 1000))
        }

        const modal = new ModalBuilder().setCustomId('addSong').setTitle('添加歌曲')

        const SongNameInput = new TextInputBuilder()
            .setCustomId('songName')
            .setLabel('請提供歌曲名稱')
            .setPlaceholder('請輸入關鍵字或連結!')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(SongNameInput)

        modal.addComponents(firstActionRow)

        await interaction.showModal(modal)
    }
} satisfies ButtonType
