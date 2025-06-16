import type { PaperClient } from '@/classes/PaperClient'
import { ChatInputCommandInteraction, GuildMember, MessageFlags } from 'discord.js'

export default {
    subCommand: 'music.filters',
    async execute(interaction: ChatInputCommandInteraction, client: PaperClient) {
        const { options } = interaction
        const member = interaction.member! as GuildMember
        const filter = options.getString('set')!
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel) {
            return interaction.reply({
                content: '<:warning:1265562532857380936> | 你必須待在語音頻道裡面才能使用音樂指令!',
                flags: MessageFlags.Ephemeral
            })
        }
        const queue = client.distube.getQueue(VoiceChannel)
        if (queue && queue.voiceChannel && VoiceChannel.id !== queue.voiceChannel.id) {
            return interaction.reply({
                content: `<:warning:1265562532857380936> | 我已經在語音頻道 - <#${queue.voiceChannel.id}> 裡播放音樂了`,
                flags: MessageFlags.Ephemeral
            })
        }

        const msg =
            '<:warning:1265562532857380936> | **注意**，可能需要等待**3**至**5**秒後才會載入過濾器!'

        if (!queue) {
            return interaction.reply({
                content: '<:outage:1265561329528471613> | 找不到歌曲!',
                flags: MessageFlags.Ephemeral
            })
        }

        const filters = queue.filters
        if (filters.has(filter)) {
            filters.remove(filter)
            return interaction.reply({
                content: `<:linkremove:1265560814769672222> | 成功移除 \`${filter}\` 過濾器\n${msg}`
            })
        } else {
            await filters.add(filter)
            return interaction.reply({
                content: `<:linkadd:1265560789503311915> | 成功增加 \`${filter}\` 過濾器\n${msg}`
            })
        }
    }
}
