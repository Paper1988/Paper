import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { deleteMessageAfter } from '@/Systems/Music.js'
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

        if (!VoiceChannel) {
            return interaction
                .reply({
                    content: `${emojis.warning} | 你必須待在語音頻道裡面才能使用音樂指令!`,
                    flags: MessageFlags.Ephemeral
                })
                .then(deleteMessageAfter)
        }
        const currentPlayer = client.moonlink?.players.get(interaction.guildId!) as Player
        if (currentPlayer?.voiceChannelId && VoiceChannel.id !== currentPlayer.voiceChannelId) {
            return await interaction
                .reply({
                    content: `${emojis.warning} | 我已經在語音頻道 - <#${currentPlayer.voiceChannelId}> 裡播放音樂了`
                })
                .then(deleteMessageAfter)
        }

        const player: Player = currentPlayer
        const Time = options.getNumber('time')!

        if (!player)
            return await interaction
                .reply({
                    content: `${emojis.outage} | 找不到歌曲或該歌曲已經播放完畢!`,
                    flags: MessageFlags.Ephemeral
                })
                .then(deleteMessageAfter)

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
