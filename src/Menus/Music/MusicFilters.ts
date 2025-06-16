import { createFilterComponents } from '@/Buttons/Music/filters'
import type { PaperClient } from '@/classes/PaperClient'
import emojis from '@/libs/emoji/emoji'
import { deleteMessageAfter } from '@/Systems/Music'
import { GuildMember, MessageFlags, StringSelectMenuInteraction, TextChannel } from 'discord.js'

export default {
    id: 'filters',
    async execute(interaction: StringSelectMenuInteraction, client: PaperClient) {
        if (!interaction.member || !(interaction.member instanceof GuildMember)) {
            return interaction.reply({
                content: '此命令只能在伺服器中使用！',
                flags: MessageFlags.Ephemeral
            })
        }

        if (!interaction.channel || !(interaction.channel instanceof TextChannel)) {
            return interaction.reply({
                content: '此命令只能在伺服器文字頻道中使用！',
                flags: MessageFlags.Ephemeral
            })
        }

        const member = interaction.member
        const VoiceChannel = member.voice.channel

        if (!VoiceChannel) {
            return await interaction.reply({
                content: `${emojis.warning} | 你必須待在一個語音頻道裡面才能使用音樂指令!`,
                flags: MessageFlags.Ephemeral
            })
        }

        const currentVoiceChannel = interaction.guild?.members.me?.voice.channelId
        if (currentVoiceChannel && VoiceChannel.id !== currentVoiceChannel) {
            return await interaction.editReply({
                content: `${emojis.warning} | 我已經在語音頻道 - <#${currentVoiceChannel}> 裡播放音樂了`
            })
        }

        const queue = client.distube.getQueue(VoiceChannel)
        if (!queue) {
            return await interaction.reply({
                content: '<:outage:1265561329528471613> | 找不到歌曲或該歌曲已經播放完畢!',
                flags: MessageFlags.Ephemeral
            })
        }
        const msg =
            '<:warning:1265562532857380936>**注意**: 可能需要等待**3**至**5**秒後才會載入過濾器!'

        const filter = interaction.values[0]
        if (!filter) return

        const filters = queue.filters
        if (filters.has(filter)) {
            filters.remove(filter)
            await interaction
                .channel!.send({
                    content: `<:linkremove_865572289022394368:1201843685084647435> | 成功移除 \`${filter}\` 過濾器\n${msg}`
                })
                .then((m) => deleteMessageAfter(m, 5 * 1000))
        } else {
            filters.add(filter)
            await interaction
                .channel!.send({
                    content: `<:linkadd_865572290065072128:1201884016404598814> | 成功增加 \`${filter}\` 過濾器\n${msg}`
                })
                .then((m) => deleteMessageAfter(m, 5 * 1000))
        }

        await interaction.update({
            components: createFilterComponents(client)
        })
    }
}
