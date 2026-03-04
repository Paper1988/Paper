import { PaperClient } from '@/Structures/classes/PaperClient.js'
import { deleteMessageAfter } from '@/Systems/Music.js'
import emojis from '@/libs/emoji/emoji.js'
import type { SubCommandType } from '@/typings/command.js'
import { ChatInputCommandInteraction, GuildMember, MessageFlags } from 'discord.js'
import { Player } from 'moonlink.js'

export default {
    subCommand: 'music.quit',
    async execute(interaction: ChatInputCommandInteraction, client: PaperClient) {
        const member = interaction.member! as GuildMember
        const VoiceChannel = member!.voice.channel

        if (!VoiceChannel)
            return await interaction
                .reply({
                    content:
                        '<:warning:1265562532857380936> | 你必須待在語音頻道裡面才能使用音樂指令!',
                    flags: MessageFlags.Ephemeral
                })
                .then(deleteMessageAfter)

        const currentPlayer = client.moonlink?.players.get(interaction.guildId!) as Player
        if (currentPlayer?.voiceChannelId && VoiceChannel.id !== currentPlayer.voiceChannelId) {
            return await interaction
                .reply({
                    content: `${emojis.warning} | 我已經在語音頻道 - <#${currentPlayer.voiceChannelId}> 裡播放音樂了`
                })
                .then(deleteMessageAfter)
        }

        if (!currentPlayer) {
            return await interaction
                .reply({
                    content: `${emojis.warning} | 目前沒有正在播放的音樂!`,
                    flags: MessageFlags.Ephemeral
                })
                .then(deleteMessageAfter)
        }

        await currentPlayer.disconnect()

        await interaction
            .reply({
                content: '<:leave:1265560726240497684> | 成功離開語音頻道!',
                flags: MessageFlags.Ephemeral
            })
            .then(deleteMessageAfter)
    }
} as SubCommandType
