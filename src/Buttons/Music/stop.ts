import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import {
    clearPlayer,
    deleteMessageAfter,
    updateMusicPlayerStatus,
    validateDJRole,
    validateVoiceChannel
} from '@/Systems/Music.js'
import emojis from '@/libs/emoji/emoji.js'
import type { ButtonType } from '@/typings/component.js'
import type { ButtonInteraction, GuildMember } from 'discord.js'
import type { Player } from 'moonlink.js'

export default {
    id: 'stop',
    async execute(interaction: ButtonInteraction, client: PaperClient) {
        if (!(await validateDJRole(interaction, client))) return

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

        await updateMusicPlayerStatus(player, client, true)
        clearPlayer(player)

        player.stop()
        player.queue.clear()

        return await interaction
            .editReply({
                content: '<:stop:1265562218498363422> | 成功停止音樂'
            })
            .then(deleteMessageAfter)
    }
} satisfies ButtonType
