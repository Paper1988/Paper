import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { deleteMessageAfter, validateVoiceChannel } from '@/Systems/Music.js'
import emojis from '@/libs/emoji/emoji.js'
import type { SubCommandType } from '@/typings/command'
import { ChatInputCommandInteraction, GuildMember, MessageFlags } from 'discord.js'
import type { Player } from 'moonlink.js'

export default {
    subCommand: 'music.seek',
    async execute(interaction: ChatInputCommandInteraction, client: PaperClient) {
        const { options } = interaction
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

        const Time = options.getNumber('time')!

        await player.seek(Time)
        await interaction
            .reply({
                content: `<:rightarrow:1265561736593801276> | 成功跳至 **\`${secondsToDuration(Time)}\`**`
            })
            .then(deleteMessageAfter)
    }
} as SubCommandType

const secondsToDuration = (seconds: string | number): string => {
    const totalSeconds = typeof seconds === 'string' ? parseInt(seconds, 10) : Math.floor(seconds)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    const pad = (num: number): string => num.toString().padStart(2, '0')

    if (hours > 0) {
        return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`
    }
    return `${pad(minutes)}:${pad(secs)}`
}
