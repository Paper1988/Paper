import type { PaperClient } from '@/classes/PaperClient'
import emojis from '@/libs/emoji/emoji'
import { deleteMessageAfter } from '@/Systems/Music'
import type { SubCommandType } from '@/typings/command'
import { ChatInputCommandInteraction, GuildMember, MessageFlags } from 'discord.js'

export default {
    subCommand: 'music.seek',
    async execute(interaction: ChatInputCommandInteraction, client: PaperClient) {
        const { options } = interaction
        const member = interaction.member! as GuildMember
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel)
            return interaction.reply({
                content: '<:warning:1265562532857380936> | 你必須待在語音頻道裡面才能使用音樂指令!',
                flags: MessageFlags.Ephemeral
            })
        const currentVoiceChannel = interaction.guild?.members.me?.voice.channelId
        if (currentVoiceChannel && VoiceChannel.id !== currentVoiceChannel)
            return await interaction.editReply({
                content: `${emojis.warning} | 我已經在語音頻道 - <#${currentVoiceChannel}> 裡播放音樂了`
            })

        const queue = client.distube.getQueue(VoiceChannel)
        const Time = options.getNumber('time')

        if (!queue)
            return interaction.reply({
                content: '<:outage:1265561329528471613> | 找不到歌曲或該歌曲已經播放完畢!',
                flags: MessageFlags.Ephemeral
            })

        queue.seek(Time!)
        await interaction
            .reply({
                content: `<:rightarrow:1265561736593801276> | 成功跳到 **\`${Time}\`**`
            })
            .then((msg) => deleteMessageAfter(msg, 10 * 1000))
    }
} as SubCommandType
