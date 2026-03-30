import MusicDB from '@/Structures/Schemas/MusicDB.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { deleteMessageAfter, validateVoiceChannel } from '@/Systems/Music.js'
import emojis from '@/libs/emoji/emoji.js'
import type { ButtonType } from '@/typings/component.js'
import { MessageFlags, type ButtonInteraction, type GuildMember } from 'discord.js'
import type { Player } from 'moonlink.js'

export default {
    id: 'autoplay',
    async execute(interaction: ButtonInteraction, client: PaperClient) {
        await interaction.deferReply()
        const guild = interaction.guild!
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

        if (player.autoPlay) player.setAutoPlay(true)
        else player.setAutoPlay(false)

        await MusicDB.findOneAndUpdate(
            { GuildID: guild.id },
            { autoplayMode: player.autoPlay },
            { returnDocument: 'after', upsert: true }
        )

        return await interaction
            .editReply({
                content: `<:update:1265562455828987968> | 成功切換自動播放模式: ${
                    player.autoPlay ? emojis.correct : emojis.xmark
                }`
            })
            .then(deleteMessageAfter)
    }
} satisfies ButtonType
