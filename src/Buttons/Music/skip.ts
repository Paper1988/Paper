import emojis from '@/libs/emoji/emoji.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import {
    deleteMessageAfter,
    updateMusicPlayerStatus,
    validateVoiceChannel
} from '@/Systems/Music.js'
import type { ButtonType } from '@/typings/component.js'
import type { ButtonInteraction, GuildMember } from 'discord.js'
import type { Player } from 'moonlink.js'

export default {
    id: 'skip',
    async execute(interaction: ButtonInteraction, client: PaperClient) {
        await interaction.deferReply()
        const member = interaction.member! as GuildMember
        const VoiceChannel = member.voice.channel

        if (!(await validateVoiceChannel(interaction, client, VoiceChannel))) return

        const player = client.moonlink?.players.get(interaction.guildId!) as Player
        if (!player || !player.current) {
            return await interaction
                .editReply({
                    content: `${emojis.warning} | 目前沒有正在播放的音樂!`
                })
                .then(deleteMessageAfter)
        }

        if (!player.queue.tracks[0] && !player.autoPlay) {
            return await interaction
                .editReply({
                    content: `${emojis.outage} | 這是最後一首歌了!`
                })
                .then(deleteMessageAfter)
        }

        await player.skip()

        return await interaction
            .editReply({
                content: `${emojis.frontforward} | 成功跳過歌曲`
            })
            .then(deleteMessageAfter)
    }
} satisfies ButtonType
