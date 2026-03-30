import MusicDB from '@/Structures/Schemas/MusicDB.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import {
    deleteMessageAfter,
    updateMusicPlayerStatus,
    validateVoiceChannel
} from '@/Systems/Music.js'
import emojis from '@/libs/emoji/emoji.js'
import type { ButtonType } from '@/typings/component.js'
import { MessageFlags, type ButtonInteraction, type GuildMember } from 'discord.js'
import { Player } from 'moonlink.js'

export default {
    id: 'loop',
    async execute(interaction: ButtonInteraction, client: PaperClient) {
        await interaction.deferReply()
        const member = interaction.member! as GuildMember
        const guild = interaction.guild!
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

        switch (player.loop) {
            case 'off':
                player.setLoop('track')
                break
            case 'track':
                player.setLoop('queue')
                break
            case 'queue':
                player.setLoop('off')
                break
        }

        await updateMusicPlayerStatus(player, client)

        await MusicDB.findOneAndUpdate(
            { GuildID: guild.id },
            { repeatMode: player.loop !== 'off' ? (player.loop == 'queue' ? 2 : 1) : 0 },
            { returnDocument: 'after', upsert: true }
        )

        return await interaction
            .editReply({
                content: `<:loop1:1265560917345570918> | 成功切換重複播放模式: ${
                    player.loop !== 'off'
                        ? player.loop == 'queue'
                            ? '<:loop2:1265560938417754213>整個清單'
                            : '<:looponce:1265560956193210399>單曲'
                        : emojis.xmark
                }`
            })
            .then(deleteMessageAfter)
    }
} satisfies ButtonType
