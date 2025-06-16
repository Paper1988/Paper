import type { PaperClient } from '@/classes/PaperClient'
import emojis from '@/libs/emoji/emoji'
import MusicDB from '@/Structures/Schemas/MusicDB'
import { deleteMessageAfter, updateMusicPlayerStatus } from '@/Systems/Music'
import type { SubCommandType } from '@/typings/command'
import { ChatInputCommandInteraction, GuildMember, MessageFlags } from 'discord.js'

export default {
    subCommand: 'music.volume',
    async execute(interaction: ChatInputCommandInteraction, client: PaperClient) {
        const { options, guild } = interaction
        const member = interaction.member! as GuildMember
        const VoiceChannel = member.voice.channel!
        const Volume = options.getNumber('percent')!
        const queue = client.distube.getQueue(VoiceChannel)

        if (!VoiceChannel) {
            return await interaction.reply({
                content: '<:warning:1265562532857380936> | 你必須待在語音頻道裡面才能使用音樂指令!',
                flags: MessageFlags.Ephemeral
            })
        }
        const currentVoiceChannel = interaction.guild?.members.me?.voice.channelId
        if (currentVoiceChannel && VoiceChannel.id !== currentVoiceChannel) {
            return await interaction.editReply({
                content: `${emojis.warning} | 我已經在語音頻道 - <#${currentVoiceChannel}> 裡播放音樂了`
            })
        }

        if (Volume > 200 || Volume < 0) {
            return await interaction.reply({
                content: '<:outage:1265561329528471613> | 你必須指定0到200之間的數字!'
            })
        }

        if (!queue) {
            return await interaction.reply({
                content: '<:outage:1265561329528471613> | 找不到歌曲或該歌曲已經播放完畢!',
                flags: MessageFlags.Ephemeral
            })
        }

        client.distube.setVolume(VoiceChannel, Volume)

        await updateMusicPlayerStatus(queue)

        await MusicDB.findOneAndUpdate(
            { GuildID: guild!.id },
            { volume: Volume },
            { new: true, upsert: true }
        )
        if (Volume < 50 && Volume > 0) {
            return await interaction
                .reply({
                    content: `<:speaker_low:1265561976663310386> | 成功設定音量: \`${Volume}%\``
                })
                .then((msg) => deleteMessageAfter(msg, 10 * 1000))
        } else if (Volume == 0) {
            return await interaction
                .reply({
                    content: '<:speaker_mute:1265561998192807936> | 成功設定音量: `0%`'
                })
                .then((msg) => deleteMessageAfter(msg, 10 * 1000))
        } else if (Volume >= 50) {
            return await interaction
                .reply({
                    content: `<:speaker:1265561928533807146> | 成功設定音量: \`${Volume}%\``
                })
                .then((msg) => deleteMessageAfter(msg, 10 * 1000))
        }
    }
} as SubCommandType
