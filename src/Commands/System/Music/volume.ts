import emojis from '@/libs/emoji/emoji.js'
import type { PaperClient } from '@/Structures/classes/PaperClient.js'
import MusicDB from '@/Structures/Schemas/MusicDB.js'
import {
    deleteMessageAfter,
    updateMusicPlayerStatus,
    validateVoiceChannel
} from '@/Systems/Music.js'
import type { SubCommandType } from '@/typings/command.js'
import { ChatInputCommandInteraction, GuildMember, MessageFlags } from 'discord.js'
import type { Player } from 'moonlink.js'

export default {
    subCommand: 'music.volume',
    async execute(interaction: ChatInputCommandInteraction, client: PaperClient) {
        const { options, guild } = interaction
        const member = interaction.member! as GuildMember
        const VoiceChannel = member.voice.channel!
        const Volume = options.getNumber('percent')!

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

        if (Volume > 1000 || Volume < 0) {
            return await interaction
                .reply({
                    content: `${emojis.warning} | 你必須指定0到1000之間的數字!`
                })
                .then(deleteMessageAfter)
        }

        if (!player) {
            return await interaction
                .reply({
                    content: `${emojis.warning} | 找不到歌曲或該歌曲已經播放完畢!`,
                    flags: MessageFlags.Ephemeral
                })
                .then(deleteMessageAfter)
        }

        player.setVolume(Volume)

        await updateMusicPlayerStatus(player, client)

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
                .then(deleteMessageAfter)
        } else if (Volume == 0) {
            return await interaction
                .reply({
                    content: '<:speaker_mute:1265561998192807936> | 成功設定音量: \`0%\`'
                })
                .then(deleteMessageAfter)
        } else if (Volume >= 50) {
            return await interaction
                .reply({
                    content: `<:speaker:1265561928533807146> | 成功設定音量: \`${Volume}%\``
                })
                .then(deleteMessageAfter)
        }
    }
} as SubCommandType
