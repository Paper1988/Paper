import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { deleteMessageAfter, validateVoiceChannel } from '@/Systems/Music.js'
import emojis from '@/libs/emoji/emoji.js'
import { Logger } from '@/libs/utils/logger.js'
import { ChatInputCommandInteraction, GuildMember, MessageFlags } from 'discord.js'
import type { Player } from 'moonlink.js'

export default {
    subCommand: 'music.jump',
    async execute(interaction: ChatInputCommandInteraction, client: PaperClient) {
        const { options } = interaction
        const member = interaction.member! as GuildMember
        const VoiceChannel = member.voice.channel

        const position = options.getNumber('position')!

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

        await player
            .skip(position)
            .then(async () => {
                return interaction
                    .reply({
                        content: `${emojis.frontforward} | 成功跳至清單位置 \`${position}\` - ${player.queue.tracks[position]}`
                    })
                    .then(deleteMessageAfter)
            })
            .catch((err) => {
                Logger.error(err)
                return interaction.reply({
                    content: `${emojis.warning} | 你提供的是無效的數字(可能是該位置沒有歌曲)!`,
                    flags: MessageFlags.Ephemeral
                })
            })
    }
}
