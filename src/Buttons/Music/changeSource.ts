import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { validateDJRole, validateVoiceChannel } from '@/Systems/Music.js'
import emojis from '@/libs/emoji/emoji.js'
import type { ButtonType } from '@/typings/component.js'
import {
    ActionRowBuilder,
    ButtonInteraction,
    GuildMember,
    MessageFlags,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js'
import type { Player } from 'moonlink.js'

export default {
    id: 'changeSource',
    async execute(interaction: ButtonInteraction, client: PaperClient) {
        if (!(await validateDJRole(interaction, client))) return
        const member = interaction.member! as GuildMember
        if (!(await validateVoiceChannel(interaction, client, member.voice.channel))) return

        const player = client.moonlink?.players.get(interaction.guildId!) as Player | undefined
        const currentTrack = player?.current
        if (!player || !currentTrack) {
            return interaction.reply({
                content: `${emojis.warning} | 目前沒有正在播放的音樂!`,
                flags: MessageFlags.Ephemeral
            })
        }

        const query = [currentTrack.author, currentTrack.title].filter(Boolean).join(' ')
        const input = new TextInputBuilder()
            .setCustomId('query')
            .setLabel('搜尋歌曲版本')
            .setPlaceholder('輸入歌曲名稱或演唱者，不接受網址')
            .setStyle(TextInputStyle.Short)
            .setMaxLength(100)
            .setRequired(true)
            .setValue(query.slice(0, 100))

        const modal = new ModalBuilder()
            .setCustomId('changeSource')
            .setTitle('更換歌曲版本')
            .addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input))

        await interaction.showModal(modal)
    }
} satisfies ButtonType
