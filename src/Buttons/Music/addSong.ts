import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { deleteMessageAfter, validateDJRole, validateVoiceChannel } from '@/Systems/Music.js'
import emojis from '@/libs/emoji/emoji.js'
import type { ButtonType } from '@/typings/component.js'
import {
    ButtonInteraction,
    GuildMember,
    LabelBuilder,
    MessageFlags,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js'
import type { Player } from 'moonlink.js'

export default {
    id: 'addSong',
    async execute(interaction: ButtonInteraction, client: PaperClient) {
        if (!(await validateDJRole(interaction, client))) return

        const member = interaction.member! as GuildMember
        const VoiceChannel = member.voice.channel

        if (!(await validateVoiceChannel(interaction, client, VoiceChannel))) return

        const player = client.moonlink?.players.get(interaction.guildId!) as Player
        if (!player || !player.current) {
            return await interaction
                .reply({
                    content: `${emojis.warning} | 目前沒有正在播放的音樂!`,
                    flags: MessageFlags.Ephemeral
                })
                .then(deleteMessageAfter)
        }

        const modal = new ModalBuilder().setCustomId('addSong').setTitle('添加歌曲')

        const SongNameInput = new TextInputBuilder()
            .setCustomId('songName')
            .setPlaceholder('請輸入關鍵字或連結!')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)

        const label = new LabelBuilder()
            .setLabel('請提供歌曲名稱')
            .setTextInputComponent(SongNameInput)

        modal.addLabelComponents(label)

        await interaction.showModal(modal)
    }
} satisfies ButtonType
