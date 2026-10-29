import MusicDB from '@/Structures/Schemas/MusicDB.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import {
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
    id: 'volumeUp',
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

        player.setVolume(player.volume + 10)

        await updateMusicPlayerStatus(player, client)

        await MusicDB.findOneAndUpdate(
            { GuildID: player.guildId },
            { volume: player.volume },
            { returnDocument: 'after', upsert: true }
        )
        return await interaction
            .editReply({
                content: `<:speaker:1265561928533807146> | 成功設置音量: \`${player.volume}%\``
            })
            .then(deleteMessageAfter)
    }
} satisfies ButtonType
