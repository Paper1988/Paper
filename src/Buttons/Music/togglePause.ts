import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import {
    deleteMessageAfter,
    updateMusicPlayerStatus,
    validateVoiceChannel
} from '@/Systems/Music.js'
import emojis from '@/libs/emoji/emoji.js'
import type { ButtonType } from '@/typings/component.js'
import type { ButtonInteraction, GuildMember } from 'discord.js'
import type { Player } from 'moonlink.js'

export default {
    id: 'togglePause',
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

        if (!player.paused) {
            player.pause()
            await updateMusicPlayerStatus(player, client)
            return await interaction
                .editReply({
                    content: '<:pause:1265561390358331462> | 成功暫停播放歌曲'
                })
                .then(deleteMessageAfter)
        } else if (player.paused || !player.playing) {
            player.resume()
            await updateMusicPlayerStatus(player, client)
            return await interaction
                .editReply({
                    content: '<:play:1265561505458294826> | 成功恢復播放歌曲'
                })
                .then(deleteMessageAfter)
        }
    }
} satisfies ButtonType
