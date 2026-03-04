import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import { deleteMessageAfter } from '@/Systems/Music.js'
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

        if (!VoiceChannel) {
            return await interaction.reply({
                content:
                    '<:warning:1265562532857380936> | 你必須待在一個語音頻道裡面才能使用音樂指令!',
                flags: MessageFlags.Ephemeral
            })
        }
        const currentPlayer = client.moonlink?.players.get(interaction.guildId!) as Player
        if (currentPlayer?.voiceChannelId && VoiceChannel.id !== currentPlayer.voiceChannelId) {
            return await interaction.reply({
                content: `${emojis.warning} | 我已經在語音頻道 - <#${currentPlayer.voiceChannelId}> 裡播放音樂了`
            })
        }

        const player: Player = currentPlayer

        if (!player)
            return await interaction.reply({
                content: '<:outage:1265561329528471613> | 找不到歌曲或該歌曲已經播放完畢!',
                flags: MessageFlags.Ephemeral
            })

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
