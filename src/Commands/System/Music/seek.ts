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

        const position = options.getString('time')!

        let milliseconds: number | undefined

        if (position.includes(':')) {
            const [minutes, seconds] = position.split(':')
            if (!minutes || !seconds)
                return interaction.reply({
                    content: `${emojis.warning} | 無效的時間格式!`,
                    flags: MessageFlags.Ephemeral
                })
            milliseconds = (parseInt(minutes!) * 60 + parseInt(seconds!)) * 1000
        } else {
            if (!position)
                return interaction.reply({
                    content: `${emojis.warning} | 無效的時間格式!`,
                    flags: MessageFlags.Ephemeral
                })
            milliseconds = parseInt(position) * 1000
        }

        if (milliseconds === undefined || isNaN(milliseconds))
            return interaction.reply({
                content: `${emojis.warning} | 無效的時間格式!`,
                flags: MessageFlags.Ephemeral
            })

        await player.seek(milliseconds)
        return interaction.reply({
            content: `<:rightarrow:1265561736593801276> | 成功跳至 **\`${secondsToDuration(milliseconds)}\`**`
        })
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
